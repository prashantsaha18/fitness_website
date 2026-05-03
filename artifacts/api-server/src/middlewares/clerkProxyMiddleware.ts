/**
 * Clerk Frontend API Proxy Middleware
 *
 * Proxies Clerk Frontend API requests through your domain, enabling Clerk
 * authentication on custom domains and .replit.app deployments without
 * requiring CNAME DNS configuration.
 *
 * AUTH CONFIGURATION: To manage users, enable/disable login providers
 * (Google, GitHub, etc.), change app branding, or configure OAuth credentials,
 * use the Auth pane in the workspace toolbar. There is no external Clerk
 * dashboard — all auth configuration is done through the Auth pane.
 *
 * IMPORTANT:
 * - Must be mounted BEFORE express.json() middleware
 *
 * Usage in app.ts:
 *   import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
 *   app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
 */

import { createProxyMiddleware } from "http-proxy-middleware";
import type { RequestHandler, Request, Response, NextFunction } from "express";
import type { IncomingHttpHeaders } from "http";
import { Readable } from "stream";

export const CLERK_PROXY_PATH = "/api/__clerk";

/**
 * Decode the Clerk FAPI URL from the publishable key.
 * Format: pk_{test|live}_{base64(domain + "$")}
 */
function getFapiUrl(publishableKey?: string): string {
  if (!publishableKey) return "https://frontend-api.clerk.dev";
  try {
    const parts = publishableKey.split("_");
    if (parts.length < 3) return "https://frontend-api.clerk.dev";
    const base64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const domain = decoded.replace(/\$+$/, "");
    if (domain && domain.includes(".")) {
      return `https://${domain}`;
    }
    return "https://frontend-api.clerk.dev";
  } catch {
    return "https://frontend-api.clerk.dev";
  }
}

/**
 * Returns the first effective public hostname for the given request,
 * preferring x-forwarded-host over the Host header so callers behind a
 * proxy see the original client-facing host.
 */
export function getClerkProxyHost(req: {
  headers: IncomingHttpHeaders;
}): string | undefined {
  const forwarded = req.headers["x-forwarded-host"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const firstHop = raw?.split(",")[0]?.trim();
  return firstHop || req.headers.host?.trim() || undefined;
}

export function clerkProxyMiddleware(): RequestHandler {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return (_req, _res, next) => next();
  }

  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  const fapiUrl = getFapiUrl(publishableKey);

  // Use REPLIT_DEV_DOMAIN (dev) or first entry of REPLIT_DOMAINS (prod)
  // as the authoritative public hostname the browser uses to reach this server.
  const replitPublicHost =
    process.env.REPLIT_DEV_DOMAIN ||
    (process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim() ||
    "";

  /**
   * For /npm/* paths (Clerk JS bundle), use a plain fetch that follows
   * redirects server-side. This avoids exposing the upstream 307 Location
   * header to the browser, which would point to an unreachable domain.
   */
  const fetchHandler: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const subpath = req.path; // e.g. /npm/@clerk/clerk-js@6/dist/clerk.browser.js
    if (!subpath.startsWith("/npm/")) {
      return next();
    }

    try {
      const upstreamUrl = `${fapiUrl}${subpath}`;
      const upstream = await fetch(upstreamUrl, {
        method: req.method,
        redirect: "follow",
        headers: {
          "Clerk-Secret-Key": secretKey,
          "User-Agent": req.headers["user-agent"] ?? "ClerkProxy/1.0",
        },
      });

      res.status(upstream.status);
      const ct = upstream.headers.get("content-type");
      if (ct) res.setHeader("Content-Type", ct);
      res.setHeader(
        "Cache-Control",
        upstream.headers.get("cache-control") ?? "public, max-age=3600",
      );
      res.setHeader("Access-Control-Allow-Origin", "*");

      if (upstream.body) {
        // pipe the web ReadableStream into the Express response
        Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
      } else {
        res.end();
      }
    } catch (err) {
      next(err);
    }
  };

  /**
   * For all other Clerk FAPI paths (auth, tokens, etc.), use a standard
   * reverse proxy. These responses are not redirected by Clerk so no
   * Location rewriting is needed.
   */
  const proxyHandler = createProxyMiddleware({
    target: fapiUrl,
    changeOrigin: true,
    pathRewrite: (path: string) =>
      path.replace(new RegExp(`^${CLERK_PROXY_PATH}`), ""),
    on: {
      proxyReq: (proxyReq, req) => {
        const protocol =
          (req.headers["x-forwarded-proto"] as string) || "https";
        const host = getClerkProxyHost(req) || replitPublicHost;
        const proxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;

        proxyReq.setHeader("Clerk-Proxy-Url", proxyUrl);
        proxyReq.setHeader("Clerk-Secret-Key", secretKey);

        const xff = req.headers["x-forwarded-for"];
        const clientIp =
          (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim() ||
          req.socket?.remoteAddress ||
          "";
        if (clientIp) {
          proxyReq.setHeader("X-Forwarded-For", clientIp);
        }
      },
    },
  }) as RequestHandler;

  // Combine: fetch handler first (handles /npm/*), then proxy for everything else
  return (req: Request, res: Response, next: NextFunction) => {
    fetchHandler(req, res, (err?: unknown) => {
      if (err) return next(err);
      proxyHandler(req, res, next);
    });
  };
}

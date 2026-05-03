import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setDefaultHeaders } from "@workspace/api-client-react";
import { authHeaders } from "@/lib/auth-store";

setDefaultHeaders(() => authHeaders());

createRoot(document.getElementById("root")!).render(<App />);

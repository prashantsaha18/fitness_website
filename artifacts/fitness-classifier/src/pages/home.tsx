import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Camera, ScanLine, RotateCcw, ChevronRight, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useClassifyPhysique, useSaveClassification } from "@workspace/api-client-react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    MediaPipePoseLandmarker: any;
    MediaPipeDrawingUtils: any;
  }
}

const PHYSIQUE_CONFIG = {
  athletic: { color: "#10b981", label: "Athletic", bg: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30" },
  skinny:   { color: "#3b82f6", label: "Lean",     bg: "from-blue-500/20 to-blue-500/5 border-blue-500/30" },
  overweight:{ color: "#f59e0b", label: "Bulky",   bg: "from-amber-500/20 to-amber-500/5 border-amber-500/30" },
} as Record<string, { color: string; label: string; bg: string }>;

export default function Home() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  const [ready,      setReady]      = useState(false);
  const [camActive,  setCamActive]  = useState(false);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [landmarks,  setLandmarks]  = useState<any>(null);
  const [, setLocation] = useLocation();
  const { setLastResult, lastResult } = useAppStore();
  const { toast } = useToast();
  const classifyMutation = useClassifyPhysique();
  const saveMutation = useSaveClassification();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { FilesetResolver, PoseLandmarker } = await import(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const lm = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        if (!cancelled) {
          landmarkerRef.current = lm;
          setReady(true);
        }
      } catch {
        if (!cancelled) toast({ variant: "destructive", title: "Failed to load AI model" });
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setCamActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setLastResult(null);
        setCamActive(true);
      }
    } catch {
      toast({ variant: "destructive", title: "Camera access denied", description: "Allow camera access to use the scanner." });
    }
  };

  const drawLoop = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const lm     = landmarkerRef.current;
    if (!video || !canvas || !lm || !camActive) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (video.videoWidth > 0) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const result = lm.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result.landmarks?.length > 0) {
        setLandmarks(result.landmarks[0]);
        const du = new window.MediaPipeDrawingUtils(ctx);
        for (const lmk of result.landmarks) {
          du.drawConnectors(lmk, window.MediaPipePoseLandmarker.POSE_CONNECTIONS, {
            color: "rgba(59,130,246,0.6)", lineWidth: 3,
          });
          du.drawLandmarks(lmk, { color: "#10b981", lineWidth: 1, radius: 3 });
        }
      }
    }
    rafRef.current = requestAnimationFrame(drawLoop);
  }, [camActive]);

  useEffect(() => {
    if (camActive) rafRef.current = requestAnimationFrame(drawLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [camActive, drawLoop]);

  const analyze = async () => {
    if (!landmarks) {
      toast({ title: "No pose detected", description: "Step into frame so your full body is visible.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const result = await classifyMutation.mutateAsync({ data: { landmarks } });
      setLastResult(result);
      stopCamera();
      saveMutation.mutate({
        data: { physiqueType: result.physiqueType, confidence: result.confidence, bodyMetrics: result.bodyMetrics },
      });
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Please try again." });
    } finally {
      setAnalyzing(false);
    }
  };

  const cfg = lastResult ? (PHYSIQUE_CONFIG[lastResult.physiqueType] ?? PHYSIQUE_CONFIG.athletic) : null;

  return (
    <Layout>
      <div className="flex flex-col items-center px-4 py-4 gap-4 max-w-md mx-auto">

        {/* Camera viewport */}
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-950 border border-white/8 shadow-2xl">

          {/* Idle state */}
          {!camActive && !lastResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
              <div className={`w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center ${ready ? "scan-ring" : ""}`}>
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center px-6">
                <p className="text-white font-semibold mb-1">AI Physique Scanner</p>
                <p className="text-zinc-500 text-sm">Stand in full view for best results</p>
              </div>
              <button
                onClick={startCamera}
                disabled={!ready}
                className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                <Camera className="w-4 h-4" />
                {ready ? "Start Camera" : "Loading AI…"}
              </button>
            </div>
          )}

          {/* Live video + skeleton overlay */}
          <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${camActive && !lastResult ? "block" : "hidden"}`} playsInline muted />
          <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${camActive && !lastResult ? "block" : "hidden"}`} />

          {/* Scanning frame corners */}
          {camActive && !lastResult && (
            <div className="absolute inset-4 pointer-events-none">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
              {landmarks && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Pose Detected</span>
                </div>
              )}
            </div>
          )}

          {/* Result overlay */}
          {lastResult && cfg && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${cfg.bg} border-0`}>
              <div className="text-center space-y-3 px-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Analysis Complete</span>
                </div>
                <h2 className="text-5xl font-black text-white tracking-tight capitalize">{lastResult.physiqueType}</h2>
                <p className="text-lg font-bold" style={{ color: cfg.color }}>
                  {(lastResult.confidence * 100).toFixed(1)}% confidence
                </p>

                {/* Mini probability bars */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(lastResult.probabilities).map(([type, prob]) => (
                    <div key={type} className="rounded-xl bg-black/30 p-2 text-center">
                      <p className="text-xs text-zinc-400 capitalize mb-1">{type}</p>
                      <p className="text-sm font-bold text-white font-mono">{((prob as number) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="w-full flex gap-3">
          {camActive && !lastResult ? (
            <button
              onClick={analyze}
              disabled={analyzing || !landmarks}
              className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-95"
            >
              {analyzing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
              ) : (
                <><ScanLine className="w-5 h-5" /> Capture & Analyze</>
              )}
            </button>
          ) : lastResult ? (
            <>
              <button
                onClick={() => { setLastResult(null); startCamera(); }}
                className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-zinc-400" />
              </button>
              <button
                onClick={() => setLocation("/results")}
                className="flex-1 h-14 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors active:scale-95"
              >
                View Full Results
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : null}
        </div>

      </div>
    </Layout>
  );
}

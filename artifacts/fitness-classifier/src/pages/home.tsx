import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Camera, Scan, Save, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useClassifyPhysique, useSaveClassification } from "@workspace/api-client-react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

// Ensure global types are available for MediaPipe (loaded via CDN)
declare global {
  interface Window {
    MediaPipePoseLandmarker: any;
    MediaPipeFilesetResolver: any;
    MediaPipeDrawingUtils: any;
  }
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastLandmarks, setLastLandmarks] = useState<any>(null);
  
  const [, setLocation] = useLocation();
  const { setLastResult, lastResult } = useAppStore();
  const { toast } = useToast();

  const classifyMutation = useClassifyPhysique();
  const saveMutation = useSaveClassification();

  // Initialize MediaPipe
  useEffect(() => {
    async function initMediaPipe() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { 
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task", 
            delegate: "GPU" 
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        landmarkerRef.current = poseLandmarker;
        setIsModelReady(true);
      } catch (err) {
        console.error("Failed to initialize MediaPipe", err);
      }
    }
    initMediaPipe();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
        setLastResult(null); // Clear previous result when restarting camera
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please allow camera access to use the analyzer."
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setIsCameraActive(false);
  };

  const drawLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !landmarkerRef.current || !isCameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      let startTimeMs = performance.now();
      const results = landmarkerRef.current.detectForVideo(video, startTimeMs);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks && results.landmarks.length > 0) {
        // Save landmarks for classification
        setLastLandmarks(results.landmarks[0]);
        
        // Draw skeleton
        const drawingUtils = new window.MediaPipeDrawingUtils(ctx);
        for (const landmark of results.landmarks) {
          drawingUtils.drawConnectors(landmark, window.MediaPipePoseLandmarker.POSE_CONNECTIONS, {
            color: "rgba(59, 130, 246, 0.8)", // Electric blue
            lineWidth: 4
          });
          drawingUtils.drawLandmarks(landmark, {
            color: "#10b981", // Accent green
            lineWidth: 2,
            radius: 4
          });
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(drawLoop);
  }, [isCameraActive]);

  useEffect(() => {
    if (isCameraActive) {
      requestRef.current = requestAnimationFrame(drawLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isCameraActive, drawLoop]);

  const handleAnalyze = async () => {
    if (!lastLandmarks) {
      toast({
        title: "No pose detected",
        description: "Please step into the frame and make sure your full body is visible.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await classifyMutation.mutateAsync({
        data: {
          landmarks: lastLandmarks
        }
      });
      
      setLastResult(result);
      stopCamera();
      
      // Automatically save it to history
      saveMutation.mutate({
        data: {
          physiqueType: result.physiqueType,
          confidence: result.confidence,
          bodyMetrics: result.bodyMetrics
        }
      });
      
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error processing your image."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndContinue = () => {
    setLocation("/results");
  };

  return (
    <Layout title="PHYSIQUE.AI">
      <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full gap-6">
        
        <div className="w-full relative aspect-[3/4] bg-muted/30 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
          {(!isCameraActive && !lastResult) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-background/80 backdrop-blur-sm">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Scan className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-muted-foreground text-center px-8">
                Position your device to capture your full body. For best results, wear form-fitting clothing.
              </p>
              <Button 
                onClick={startCamera} 
                disabled={!isModelReady}
                className="mt-2"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isModelReady ? "Start Camera" : "Loading Model..."}
              </Button>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover ${(lastResult || !isCameraActive) ? 'hidden' : 'block'}`}
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${(lastResult || !isCameraActive) ? 'hidden' : 'block'}`}
          />
          
          {lastResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-md z-20 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <p className="text-sm font-bold tracking-widest text-primary uppercase mb-2">Analysis Complete</p>
                <h2 className="text-4xl font-black capitalize tracking-tight">{lastResult.physiqueType}</h2>
              </div>
              
              <div className="w-full space-y-4 max-w-[280px]">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</span>
                  <span className="text-xl font-bold font-mono text-primary">{(lastResult.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={lastResult.confidence * 100} className="h-3" />
                
                <div className="grid grid-cols-3 gap-2 mt-8">
                  {Object.entries(lastResult.probabilities).map(([type, prob]) => (
                    <div key={type} className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{type}</span>
                      <span className="text-sm font-bold font-mono text-white">{(prob * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex gap-3">
          {(!lastResult && isCameraActive) ? (
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !lastLandmarks}
            >
              {isAnalyzing ? (
                <div className="flex items-center animate-pulse">
                  <Scan className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Capture & Analyze"
              )}
            </Button>
          ) : lastResult ? (
            <>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-14 h-14 px-0 shrink-0 border-white/10 hover:bg-white/5"
                onClick={startCamera}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg font-bold bg-white text-black hover:bg-gray-200 transition-all"
                onClick={handleSaveAndContinue}
              >
                View Detailed Results
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

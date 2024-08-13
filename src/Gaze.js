import React, { useEffect, useRef, useState } from "react";

const Gaze = () => {
  const [gazefilter, setGazeFilter] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/gazefilter.js";
    script.async = true;
    script.onload = () => setGazeFilter(window.gazefilter);
    script.onerror = () => setError("Failed to load gaze filter script.");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (gazefilter) {
      gazefilter
        .init("./gazefilter.wasm")
        .then(() => {
          setIsInitialized(true);
          if (canvasRef.current) {
            gazefilter.visualizer.setCanvas(canvasRef.current);
            gazefilter.visualizer.setListener("filter", render);
          }
          setupCamera();
        })
        .catch((err) => {
          setError("Failed to initialize gaze filter.");
          console.error(err);
        });
    }

    return () => {
      if (gazefilter) {
        // gazefilter.tracker.disconnect();
      }
    };
  }, [gazefilter]);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.play();
      gazefilter.tracker.setVideoElement(videoElement);
      console.log("Camera started");
    } catch (error) {
      console.error("Camera access denied:", error);
      setError("Camera access denied.");
    }
  };

  const render = (ctx, trackEvent) => {
    console.log("Rendering frame...");
    ctx.drawImage(
      gazefilter.tracker.videoElement(),
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
  };

  return (
    <div>
      {error ? (
        <p>Error: {error}</p>
      ) : isInitialized ? (
        <canvas ref={canvasRef} id="tracker-canvas" />
      ) : (
        <p>Loading GazeFilter...</p>
      )}
    </div>
  );
};

export default Gaze;

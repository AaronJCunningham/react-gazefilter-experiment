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
          return gazefilter.tracker.connect(); // Connect to the first available device
        })
        .then(() => {
          setIsInitialized(true);
          if (canvasRef.current) {
            gazefilter.visualizer.setCanvas(canvasRef.current);
            gazefilter.visualizer.setListener("filter", render);
          }
        })
        .catch((err) => {
          setError("Failed to initialize or connect gaze filter.");
          console.error(err);
        });
    }
  }, [gazefilter]);

  const render = (ctx, trackEvent) => {
    console.log("Rendering frame...");
    // Check if video element is present
    const videoElement = gazefilter.tracker.videoElement();
    if (videoElement) {
      ctx.drawImage(videoElement, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    // Additional rendering logic for landmarks and pupils, if required
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

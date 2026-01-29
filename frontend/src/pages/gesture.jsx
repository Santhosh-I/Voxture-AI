import { useRef, useState, useEffect } from "react";
import "../styles/gesture.css";
import NavBar from "../components/NavBar";

function Gesture({ onNavigate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [result, setResult] = useState("—");
  const [cameraOn, setCameraOn] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [animationType, setAnimationType] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const predictionBuffer = useRef([]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCameraOn(false);
    setResult("—");
    setProcessedImage(null);
    predictionBuffer.current = [];
  };

  const toggleCamera = () => {
    if (cameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const stabilizePrediction = (newPrediction) => {
    const buffer = predictionBuffer.current;
    buffer.push(newPrediction);
    if (buffer.length > 5) buffer.shift();

    const counts = {};
    buffer.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });

    for (let key in counts) {
      if (counts[key] >= 3) {
        setResult(key);
        return;
      }
    }
  };

  const captureAndSend = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg");

    try {
      const res = await fetch("http://127.0.0.1:5000/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();

      if (data.gesture) {
        stabilizePrediction(data.gesture);
      }

      if (data.image) {
        setProcessedImage(data.image);
      }
    } catch (err) {
      console.error("Recognition error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (cameraOn) {
      intervalRef.current = setInterval(() => {
        captureAndSend();
      }, 600); // ~1.6 FPS (safe for Flask)
      
      // Cycle through different animations every 3 seconds
      const animationInterval = setInterval(() => {
        setAnimationType(prev => (prev + 1) % 4);
      }, 3000);
      
      return () => {
        clearInterval(intervalRef.current);
        clearInterval(animationInterval);
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraOn]);
  
  // Reset states when camera stops
  useEffect(() => {
    if (!cameraOn) {
      setAnimationType(0);
      setIsProcessing(false);
    }
  }, [cameraOn]);

  return (
    <div className="gesture-container">
      {/* Animated background dots */}
      <div className="bg-dots"></div>

      {/* Header */}
      <NavBar currentPage="gesture" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="hero">
        <div className="badge">
          <span className="badge-icon">✨</span> Smart Recognition
        </div>
        <h1 className="hero-title">
          Real-Time Sign Language
          <br />
          <span className="gradient-text">AI Recognition!</span>
        </h1>
        <p className="hero-subtitle">
          Effortless hand gesture detection happening automatically with AI precision.
        </p>

        <button onClick={toggleCamera} className="cta-button">
          <span className="cta-glow"></span>
          {cameraOn ? "Stop Camera" : "Start Camera"}
        </button>
      </section>

      {/* Main Content Cards */}
      <div className="content-grid">
        {/* Live Camera Feed Card */}
        <div className="card card-orange">
          <div className="card-header">
            <h3>Live Camera Feed</h3>
            <div className="status-indicator">
              <div className={`status-dot ${cameraOn ? "active" : ""}`}></div>
              {cameraOn ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              className="video-feed"
            />
            {!cameraOn && (
              <div className="video-placeholder">
                <div className="placeholder-icon">📹</div>
                <p>Camera feed will appear here</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} hidden />

          {/* Recognition Result Badge */}
          <div className="result-badge">
            <div className="result-label">Detected Gesture</div>
            <div className="result-value">{result}</div>
            <div className="result-hint">Stabilized prediction</div>
          </div>
        </div>

        {/* AI Processing Card */}
        <div className="card card-purple">
          <div className="card-header">
            <h3>AI Hand Detection</h3>
            <div className="live-badge">
              <span className="pulse"></span> Live processing
            </div>
          </div>

          {processedImage ? (
            <>
              <div className="processed-image-container">
                <img
                  src={processedImage}
                  alt="Processed Hand"
                  className="processed-image"
                />
              </div>

              <div className="model-info">
                <div className="info-icon">🧠</div>
                <div className="info-content">
                  <div className="info-title">Model Active</div>
                  <div className="info-subtitle">Hand landmarks detected</div>
                </div>
                <div className="info-time">Live</div>
              </div>
            </>
          ) : (
            <div className="processing-placeholder">
              {!cameraOn ? (
                <div className="ai-standby">
                  <div className="standby-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H19C20.1 17 21 16.1 21 15V9H23V7H21ZM19 15H5V3H13V9H19V15ZM7 18H17V20C17 21.1 16.1 22 15 22H9C7.9 22 7 21.1 7 20V18Z" fill="currentColor"/>
                      <circle cx="9" cy="12" r="1" fill="currentColor"/>
                      <circle cx="15" cy="12" r="1" fill="currentColor"/>
                      <path d="M12 13.5L10.5 15H13.5L12 13.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p>AI Ready to Detect</p>
                  <div className="placeholder-hint">
                    Start camera to begin processing
                  </div>
                </div>
              ) : (
                <div className={`ai-animation animation-${animationType}`}>
                  {animationType === 0 && (
                    <div className="neural-network">
                      <div className="cpu-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M7 3V7M17 3V7M7 17V21M17 17V21M3 7H7M3 17H7M17 7H21M17 17H21" stroke="currentColor" strokeWidth="2"/>
                          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
                        </svg>
                      </div>
                      <div className="nodes">
                        <div className="node"></div>
                        <div className="node"></div>
                        <div className="node"></div>
                        <div className="node"></div>
                      </div>
                      <div className="connections"></div>
                    </div>
                  )}
                  {animationType === 1 && (
                    <div className="hand-scanner">
                      <div className="scanner-grid">
                        <div className="scan-line"></div>
                      </div>
                      <div className="hand-outline">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C12.55 2 13 2.45 13 3V7H16C16.55 7 17 7.45 17 8C17 8.55 16.55 9 16 9H13V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13H13V15H20C20.55 15 21 15.45 21 16C21 16.55 20.55 17 20 17H13V19C13 19.55 12.55 20 12 20H8C7.45 20 7 19.55 7 19V17H4C3.45 17 3 16.55 3 16C3 15.45 3.45 15 4 15H7V13H2C1.45 13 1 12.55 1 12C1 11.45 1.45 11 2 11H7V9H5C4.45 9 4 8.55 4 8C4 7.45 4.45 7 5 7H7V3C7 2.45 7.45 2 8 2H12Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {animationType === 2 && (
                    <div className="data-flow">
                      <div className="analytics-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 18V12H5V18H3ZM7 18V6H9V18H7ZM11 18V10H13V18H11ZM15 18V4H17V18H15ZM19 18V8H21V18H19Z" fill="currentColor" opacity="0.6"/>
                        </svg>
                      </div>
                      <div className="data-stream">
                        <div className="data-bit"></div>
                        <div className="data-bit"></div>
                        <div className="data-bit"></div>
                      </div>
                    </div>
                  )}
                  {animationType === 3 && (
                    <div className="brain-waves">
                      <div className="brain-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.69 2 6 4.69 6 8C6 9.89 6.91 11.57 8.35 12.65C8.13 13.04 8 13.5 8 14C8 15.66 9.34 17 11 17H13C14.66 17 16 15.66 16 14C16 13.5 15.87 13.04 15.65 12.65C17.09 11.57 18 9.89 18 8C18 4.69 15.31 2 12 2ZM12 4C14.21 4 16 5.79 16 8C16 9.25 15.47 10.39 14.6 11.19L14 11.66V14C14 14.55 13.55 15 13 15H11C10.45 15 10 14.55 10 14V11.66L9.4 11.19C8.53 10.39 8 9.25 8 8C8 5.79 9.79 4 12 4Z" fill="currentColor" opacity="0.7"/>
                          <circle cx="10" cy="9" r="1" fill="currentColor"/>
                          <circle cx="14" cy="9" r="1" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="wave wave-1"></div>
                      <div className="wave wave-2"></div>
                      <div className="wave wave-3"></div>
                    </div>
                  )}
                  <p className="animation-label">
                    {animationType === 0 && "Neural Network Processing"}
                    {animationType === 1 && "Scanning for Hands"}
                    {animationType === 2 && "Analyzing Data Stream"}
                    {animationType === 3 && "AI Thinking"}
                  </p>
                  <div className="placeholder-hint">
                    {isProcessing ? "Processing frame..." : "Ready for detection"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gesture;
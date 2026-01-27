import { useRef, useState, useEffect } from "react";
import "../styles/gesture.css";

function Gesture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [result, setResult] = useState("—");
  const [cameraOn, setCameraOn] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  const predictionBuffer = useRef([]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
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
    }
  };

  useEffect(() => {
    if (cameraOn) {
      intervalRef.current = setInterval(() => {
        captureAndSend();
      }, 600); // ~1.6 FPS (safe for Flask)
    }

    return () => clearInterval(intervalRef.current);
  }, [cameraOn]);

  return (
    <div className="gesture-container">
      {/* Animated background dots */}
      <div className="bg-dots"></div>

      {/* Header */}
      <header className="header">
        <div className="logo">Voxture-AI</div>
        <nav className="nav">
          <button className="nav-btn active">
            <span className="icon">🏠</span> Home
          </button>
          <button className="nav-btn">Product</button>
          <button className="nav-btn">Use cases</button>
        </nav>
        <div className="header-actions">
          <button className="btn-secondary">Log In</button>
          <button className="btn-primary">Book a Demo</button>
        </div>
      </header>

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

        {!cameraOn && (
          <button onClick={startCamera} className="cta-button">
            <span className="cta-glow"></span>
            Start Camera
          </button>
        )}
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
              <div className="spinner"></div>
              <p>Waiting for hand detection...</p>
              <div className="placeholder-hint">
                Start camera to begin AI processing
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gesture;
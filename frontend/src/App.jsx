import { useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState("—");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    videoRef.current.srcObject = stream;
  };

  const captureAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg");

    const res = await fetch("http://127.0.0.1:5000/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const data = await res.json();
    setResult(data.gesture || "Error");
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        background: "#0f0f0f",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h1>Voxture-AI v0</h1>
      <p>Basic Sign Language Recognition</p>

      <video
        ref={videoRef}
        autoPlay
        style={{
          width: "400px",
          borderRadius: "8px",
          border: "2px solid #555",
        }}
      />

      <br />
      <br />

      <button onClick={startCamera} style={btnStyle}>
        Start Camera
      </button>
      <button onClick={captureAndSend} style={btnStyle}>
        Recognize Sign
      </button>

      <canvas ref={canvasRef} hidden />

      <h2 style={{ marginTop: "20px" }}>
        Detected: <span style={{ color: "#4caf50" }}>{result}</span>
      </h2>
    </div>
  );
}

const btnStyle = {
  padding: "10px 20px",
  marginRight: "10px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "6px",
};

export default App;

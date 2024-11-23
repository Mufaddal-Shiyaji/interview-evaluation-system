import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

const SystemCheck = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const interviewerUsername = localStorage.getItem("interviewerUsername");
  const intervieweeUsername = localStorage.getItem("intervieweeUsername");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Request camera and microphone permissions
  const handleMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermissionsGranted(true);
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      visualizeAudio(stream);
    } catch (error) {
      alert("Camera and Microphone access are required to proceed.");
    }
  };

  // Visualize audio waveform
  const visualizeAudio = (stream) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawWaveform = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "blue";

        canvasCtx.beginPath();
        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      requestAnimationFrame(drawWaveform);
    };

    drawWaveform();
  };

  // Handle terms checkbox change
  const handleTermsCheckbox = () => {
    setTermsAccepted(!termsAccepted);
  };

  // Handle submit button
  const handleSubmit = async () => {
    console.log("Submit clicked");
    console.log(testId, interviewerUsername, intervieweeUsername);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/interviews/create",
        {
          testId,
          interviewerUsername,
          intervieweeUsername,
        }
      );
      const interviewId = response.data._id;
      navigate(`/interview/${interviewId}`);
    } catch (error) {
      alert("Error creating interview: " + error.message);
    }
  };

  // Capture a photo and send it for verification
  const handleVerifyYourself = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      let imageBase64 = canvas.toDataURL("image/png");
      imageBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      try {
        const response = await axios.post(
          "http://localhost:5000/api/interviews/verify",
          {
            username: intervieweeUsername,
            image: imageBase64,
          }
        );

        if (response.data.verified) {
          setVerificationSuccess(true);
          alert("Verification successful");
        } else {
          alert(
            "Verification failed: Please make sure you are the authorized user."
          );
        }
      } catch (error) {
        alert("Error verifying identity: " + error.message);
      }
    }
  };

  useEffect(() => {
    handleMediaPermissions();

    // Stop video stream on component unmount
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      className="system-check-container"
      style={{
        width: "70%",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        System Check and Terms & Conditions
      </h2>

      <p
        style={{
          fontSize: "16px",
          marginBottom: "10px",
          color: "#555",
        }}
      >
        Please allow camera and microphone access to proceed.
      </p>
      <p
        style={{
          fontSize: "16px",
          marginBottom: "20px",
          color: "#555",
        }}
      >
        Read and accept the terms and conditions below to start the interview.
      </p>

      {/* Video Preview Box */}
      <div
        className="video-preview"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: "300px",
            height: "200px",
            border: "2px solid #ccc",
            borderRadius: "8px",
          }}
        ></video>
      </div>

      {/* Audio Waveform */}
      <div
        className="audio-waveform"
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        ></canvas>
      </div>

      {/* Verify Yourself Button */}
      <button
        onClick={handleVerifyYourself}
        disabled={!permissionsGranted}
        style={{
          display: "block",
          width: "200px",
          margin: "0 auto 20px auto",
          padding: "10px 20px",
          backgroundColor: permissionsGranted ? "#007bff" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: permissionsGranted ? "pointer" : "not-allowed",
        }}
      >
        Verify Yourself
      </button>

      {/* Terms and Conditions Box */}
      <div
        className="terms-box"
        style={{
          padding: "10px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "10px",
          }}
        >
          [-Whiteboard for rough work -Don't use notebooks or phone -Strict
          monitoring -Any suspicious activity will be flagged]
        </p>
        <label
          style={{
            fontSize: "14px",
            color: "#333",
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={handleTermsCheckbox}
            style={{
              marginRight: "8px",
            }}
          />
          I agree to the terms and conditions.
        </label>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!(termsAccepted && permissionsGranted && verificationSuccess)}
        style={{
          display: "block",
          width: "200px",
          margin: "0 auto",
          padding: "10px 20px",
          backgroundColor:
            termsAccepted && permissionsGranted && verificationSuccess
              ? "#28a745"
              : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor:
            termsAccepted && permissionsGranted && verificationSuccess
              ? "pointer"
              : "not-allowed",
        }}
      >
        Start Interview
      </button>
    </div>
  );
};

export default SystemCheck;

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

  // Enable the submit button only when permissions and terms are accepted
  const handleTermsCheckbox = () => {
    setTermsAccepted(!termsAccepted);
  };

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
    <div className="system-check-container">
      <h2>System Check and Terms & Conditions</h2>
      <p>Please allow camera and microphone access to proceed.</p>
      <p>
        Read and accept the terms and conditions below to start the interview.
      </p>

      {/* Video Preview Box */}
      <div className="video-preview">
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "300px", height: "200px" }}
        ></video>
      </div>

      {/* Audio Waveform */}
      <div className="audio-waveform">
        <canvas ref={canvasRef} width={300} height={100}></canvas>
      </div>

      {/* Terms and Conditions Box */}
      <div className="terms-box">
        <p>
          [-Whiteboard for rough work -Don't use notebooks or phone -Strict
          monitoring -Any suspicious activity will be flagged]
        </p>
        <label>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={handleTermsCheckbox}
          />
          I agree to the terms and conditions.
        </label>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        //disabled={!permissionsGranted || !termsAccepted}
        disabled={!(termsAccepted && permissionsGranted)}
      >
        Start Interview
      </button>
    </div>
  );
};

export default SystemCheck;

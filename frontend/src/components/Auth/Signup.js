import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [role, setRole] = useState("interviewee"); // Default role
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(""); // For storing captured image
  const [company, setCompany] = useState("");
  const [resume, setResume] = useState(null); // For storing uploaded resume
  const [showCamera, setShowCamera] = useState(false); // Toggle camera view
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const base64Data = imageSrc.replace(/^data:image\/[a-z]+;base64,/, "");
    setImage(base64Data); // Set captured image as base64
    setShowCamera(false); // Close camera view
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file); // Store the uploaded resume file in state
    }
  };

  const handleSignup = async () => {
    try {
      const endpoint =
        role === "interviewer"
          ? "http://localhost:5000/api/auth/interviewer/signup"
          : "http://localhost:5000/api/auth/interviewee/signup";

      const data = {
        username,
        email,
        password,
        image,
        company: role === "interviewer" ? company : null,
        resume, // This will not be sent to the backend as per your request
      };

      await axios.post(endpoint, data);
      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      alert("Error during signup");
      console.error(err);
    }
  };

  return (
    <div
      className="signup-container"
      style={{
        width: "50%",
        margin: "20px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Sign Up
      </h2>

      {/* Role Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "inline-block",
            marginRight: "15px",
            fontSize: "16px",
            color: "#555",
          }}
        >
          <input
            type="radio"
            name="role"
            value="interviewee"
            checked={role === "interviewee"}
            onChange={() => setRole("interviewee")}
            style={{ marginRight: "5px" }}
          />
          Interviewee
        </label>
        <label
          style={{
            display: "inline-block",
            fontSize: "16px",
            color: "#555",
          }}
        >
          <input
            type="radio"
            name="role"
            value="interviewer"
            checked={role === "interviewer"}
            onChange={() => setRole("interviewer")}
            style={{ marginRight: "5px" }}
          />
          Interviewer
        </label>
      </div>

      {/* Input Fields */}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      {/* Interviewee Specific Fields */}
      {role === "interviewee" && (
        <>
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={showCamera}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={() => setShowCamera(!showCamera)}
            style={{
              cursor: "pointer",
              padding: "8px 12px",
              fontSize: "14px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            {showCamera ? "Close Camera" : "Capture Photo"}
          </button>
          {showCamera && (
            <div style={{ marginBottom: "10px" }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="20%"
                style={{
                  display: "block",
                  margin: "10px auto",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={handleCapture}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  fontSize: "14px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                Take Photo
              </button>
            </div>
          )}
          <div>
            <label
              htmlFor="resume-upload"
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#555",
              }}
            >
              Upload Resume (PDF/JPG):
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf, .jpg, .jpeg"
              onChange={handleResumeUpload}
              style={{
                display: "block",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            />
            {resume && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#333",
                  marginTop: "5px",
                }}
              >
                Uploaded: {resume.name}
              </p>
            )}
          </div>
        </>
      )}

      {/* Interviewer Specific Fields */}
      {role === "interviewer" && (
        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "14px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      )}

      {/* Submit Button */}
      <button
        onClick={handleSignup}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        Sign Up
      </button>

      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </p>
    </div>
  );
};

export default Signup;

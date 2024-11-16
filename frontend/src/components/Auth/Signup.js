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
  const [showCamera, setShowCamera] = useState(false); // Toggle camera view
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const base64Data = imageSrc.replace(/^data:image\/[a-z]+;base64,/, "");
    setImage(base64Data); // Set captured image as base64
    setShowCamera(false); // Close camera view
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
    <div className="signup-container">
      <h2>Sign Up</h2>
      <div>
        <label>
          <input
            type="radio"
            name="role"
            value="interviewee"
            checked={role === "interviewee"}
            onChange={() => setRole("interviewee")}
          />
          Interviewee
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="interviewer"
            checked={role === "interviewer"}
            onChange={() => setRole("interviewer")}
          />
          Interviewer
        </label>
      </div>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {role === "interviewee" && (
        <>
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={showCamera} // Disable if camera is active
          />
          <button onClick={() => setShowCamera(!showCamera)}>
            {showCamera ? "Close Camera" : "Capture Photo"}
          </button>
          {showCamera && (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="20%"
              />
              <button onClick={handleCapture}>Take Photo</button>
            </div>
          )}
        </>
      )}
      {role === "interviewer" && (
        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      )}
      <button onClick={handleSignup}>Sign Up</button>

      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")}>Log In</button>
      </p>
    </div>
  );
};

export default Signup;

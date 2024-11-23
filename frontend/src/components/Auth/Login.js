import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [role, setRole] = useState("interviewee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const endpoint =
        role === "interviewer"
          ? "http://localhost:5000/api/auth/interviewer/login"
          : "http://localhost:5000/api/auth/interviewee/login";

      const data = { username, password };

      const response = await axios.post(endpoint, data);

      alert("Login successful");
      if (role == "interviewer") {
        localStorage.setItem("interviewerUsername", response.data.username);
        navigate("/tests");
      } else {
        localStorage.setItem("intervieweeUsername", response.data.username);
        navigate("/tests/interviewee");
      }
      // Navigate to dashboard or home
    } catch (err) {
      alert("Error during login");
      console.error(err);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        width: "40%",
        margin: "50px auto",
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
        Log In
      </h2>

      {/* Role Selection */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
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

      {/* Username Input */}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      {/* Password Input */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      {/* Login Button */}
      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Log In
      </button>
    </div>
  );
};

export default Login;

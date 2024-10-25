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
      localStorage.setItem("interviewerUsername", response.data.username);
      localStorage.setItem("token", response.data.token);
      alert("Login successful");
      if (role == "interviewer") {
        navigate("/tests");
      } else {
        //rewrite
        navigate("/");
      }
      // Navigate to dashboard or home
    } catch (err) {
      alert("Error during login");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2>
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
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};

export default Login;

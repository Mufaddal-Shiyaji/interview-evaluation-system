import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateTest = () => {
  const [interviewType, setInterviewType] = useState(""); // Stores the selected interview types
  const [selectedInterviewTypes, setSelectedInterviewTypes] = useState([]);
  const [testDetails, setTestDetails] = useState({
    time: "",
    specificRequirements: "",
  });

  const [studentUsernames, setStudentUsernames] = useState([]);
  const [currentUsername, setCurrentUsername] = useState("");
  const [isGeneral, setIsGeneral] = useState(true); // Tracks whether "General" or "Specific" is selected

  const navigate = useNavigate();

  const handleTestDetailsChange = (e) => {
    setTestDetails({ ...testDetails, [e.target.name]: e.target.value });
  };

  const handleOptionTypeChange = (type) => {
    setIsGeneral(type === "general");
    setSelectedInterviewTypes([]);
    setInterviewType("");
  };

  const handleTypeSelection = (type) => {
    if (isGeneral) {
      if (selectedInterviewTypes.includes(type)) {
        setSelectedInterviewTypes(
          selectedInterviewTypes.filter((t) => t !== type)
        );
      } else if (selectedInterviewTypes.length < 3) {
        setSelectedInterviewTypes([...selectedInterviewTypes, type]);
      }
    } else {
      setSelectedInterviewTypes([type]);
    }
  };

  const handleUsernameSubmit = () => {
    if (currentUsername) {
      setStudentUsernames([...studentUsernames, currentUsername]);
      setCurrentUsername("");
    }
  };

  const handleUsernameDelete = (usernameToDelete) => {
    setStudentUsernames(
      studentUsernames.filter((username) => username !== usernameToDelete)
    );
  };

  const interviewerUsername = localStorage.getItem("interviewerUsername");

  const handleTestSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/tests/create/${interviewerUsername}`,
        {
          interviewType: selectedInterviewTypes.join(", "),
          ...testDetails,
          studentUsernames,
          token,
        }
      );

      alert("Test created successfully");
      navigate("/tests");
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };

  return (
    <div
      className="create-test-container"
      style={{
        width: "60%",
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
        Create a New Test
      </h2>

      {/* Interview Type Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#555",
          }}
        >
          Select Interview Type
        </label>
        <div>
          <button
            onClick={() => handleOptionTypeChange("general")}
            style={{
              cursor: "pointer",
              padding: "8px 12px",
              margin: "5px",
              fontSize: "14px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            General
          </button>
          <button
            onClick={() => handleOptionTypeChange("specific")}
            style={{
              cursor: "pointer",
              padding: "8px 12px",
              margin: "5px",
              fontSize: "14px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Specific
          </button>
        </div>
      </div>

      {/* Options for General or Specific Interview */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#555",
          }}
        >
          Select Interview Types
        </label>
        <div>
          {[
            "Frontend",
            "Backend",
            "Full Stack",
            "Java Developer",
            "Python Developer",
            "Data Analyst",
            "Data Scientist",
          ].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelection(type)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                margin: "5px",
                fontSize: "14px",
                backgroundColor: selectedInterviewTypes.includes(type)
                  ? "lightgreen"
                  : "lightgray",
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "#333",
              }}
              disabled={
                !isGeneral &&
                selectedInterviewTypes.length >= 1 &&
                !selectedInterviewTypes.includes(type)
              }
            >
              {type}
            </button>
          ))}
        </div>
        <p style={{ color: "#555", marginTop: "10px" }}>
          {isGeneral
            ? "You can select up to 3 types."
            : "You can select only 1 type."}
        </p>
      </div>

      {/* Time */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#555",
          }}
        >
          Time (minutes)
        </label>
        <select
          name="time"
          value={testDetails.time}
          onChange={handleTestDetailsChange}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="">Select Time</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>

      {/* Specific Requirements */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#555",
          }}
        >
          Specific Requirements
        </label>
        <textarea
          name="specificRequirements"
          value={testDetails.specificRequirements}
          onChange={handleTestDetailsChange}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Add Student Usernames */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#555",
          }}
        >
          Enter Student Username
        </label>
        <input
          type="text"
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={handleUsernameSubmit}
          style={{
            cursor: "pointer",
            padding: "8px 12px",
            fontSize: "14px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Submit Username
        </button>
      </div>

      {/* Display added usernames with delete option */}
      <ul style={{ listStyleType: "none", padding: "0", marginBottom: "20px" }}>
        {studentUsernames.map((username, index) => (
          <li
            key={index}
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {username}
            <button
              onClick={() => handleUsernameDelete(username)}
              style={{
                cursor: "pointer",
                padding: "5px 10px",
                fontSize: "12px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Publish Test Button */}
      <button
        onClick={handleTestSubmit}
        disabled={selectedInterviewTypes.length === 0}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor:
            selectedInterviewTypes.length === 0 ? "#6c757d" : "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor:
            selectedInterviewTypes.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        Publish Test
      </button>
    </div>
  );
};
x;

export default CreateTest;

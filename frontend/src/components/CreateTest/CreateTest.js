import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateTest = () => {
  const [testDetails, setTestDetails] = useState({
    subject: "",
    difficultyLevel: "",
    subTopic: "",
    time: "",
    specificRequirements: "",
  });

  const [studentUsernames, setStudentUsernames] = useState([]);
  const [currentUsername, setCurrentUsername] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setTestDetails({ ...testDetails, [e.target.name]: e.target.value });
  };

  const handleUsernameSubmit = () => {
    if (currentUsername) {
      setStudentUsernames([...studentUsernames, currentUsername]);
      setCurrentUsername("");
    }
  };

  const handleUsernameDelete = (usernameToDelete) => {
    const updatedUsernames = studentUsernames.filter(
      (username) => username !== usernameToDelete
    );
    setStudentUsernames(updatedUsernames);
  };

  const interviewerUsername = localStorage.getItem("interviewerUsername");

  const handleTestSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(interviewerUsername);
      const response = await axios.post(
        `http://localhost:5000/api/tests/create/${interviewerUsername}`,
        {
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
    <div className="create-test-container">
      <h2>Create a New Test</h2>

      {/* Subject */}
      <div>
        <label>Subject</label>
        <select name="subject" onChange={handleInputChange}>
          <option value="">Select Subject</option>
          <option value="DSA">DSA</option>
          <option value="DBMS">DBMS</option>
          <option value="OS">OS</option>
        </select>
      </div>

      {/* Difficulty Level */}
      <div>
        <label>Difficulty Level</label>
        <select name="difficultyLevel" onChange={handleInputChange}>
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Sub-Topic */}
      <div>
        <label>Sub-Topic</label>
        <select
          name="subTopic"
          value={testDetails.subTopic}
          onChange={handleInputChange}
        >
          <option value="">Select Sub-Topic</option>
          <option value="Trees">Trees</option>
          <option value="Graphs">Graphs</option>
          <option value="Normalization">Normalization</option>
          <option value="Concurrency">Concurrency</option>
          {/* Add more sub-topic options as needed */}
        </select>
      </div>

      {/* Time */}
      <div>
        <label>Time (minutes)</label>
        <select
          name="time"
          value={testDetails.time}
          onChange={handleInputChange}
        >
          <option value="">Select Time</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>

      {/* Specific Requirements */}
      <div>
        <label>Specific Requirements</label>
        <textarea
          name="specificRequirements"
          value={testDetails.specificRequirements}
          onChange={handleInputChange}
        />
      </div>

      {/* Add Student Usernames */}
      <div>
        <label>Enter Student Username</label>
        <input
          type="text"
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
        />
        <button onClick={handleUsernameSubmit}>Submit Username</button>
      </div>

      {/* Display added usernames with delete option */}
      <ul>
        {studentUsernames.map((username, index) => (
          <li key={index}>
            {username}{" "}
            <button onClick={() => handleUsernameDelete(username)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Publish Test Button */}
      <button onClick={handleTestSubmit}>Publish Test</button>
    </div>
  );
};

export default CreateTest;

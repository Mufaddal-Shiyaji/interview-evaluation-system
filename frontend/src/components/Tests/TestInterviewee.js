import React, { useEffect, useState } from "react";
import axios from "axios";

const IntervieweeTests = () => {
  const [tests, setTests] = useState([]);
  const intervieweeUsername = localStorage.getItem("intervieweeUsername"); // Fetch username from localStorage

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tests/interviewee/${intervieweeUsername}`
        );
        setTests(response.data.testStatuses);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchTests();
  }, [intervieweeUsername]);

  const handleStartTest = (testId) => {
    // Redirect interviewee to the test-taking interface
    window.location.href = `/tests/${testId}/preview`;
  };

  return (
    <div
      className="interviewee-tests"
      style={{
        width: "60%",
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
        Your Tests
      </h2>

      {tests.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tests.map(({ test, completed, resultPDF }) => (
            <li
              key={test._id}
              className="test-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#fff",
              }}
            >
              <span
                style={{
                  color: "#333",
                  fontSize: "16px",
                }}
              >
                {test.interviewType} - Time: {test.time} minutes
              </span>
              {completed ? (
                resultPDF ? (
                  <a
                    href={resultPDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "green",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    View Results
                  </a>
                ) : (
                  <span
                    style={{
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    Completed
                  </span>
                )
              ) : (
                <button
                  onClick={() => handleStartTest(test._id)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Start
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
          }}
        >
          No tests found.
        </p>
      )}
    </div>
  );
};

export default IntervieweeTests;

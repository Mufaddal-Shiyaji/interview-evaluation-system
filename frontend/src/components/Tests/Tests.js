import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Tests = () => {
  const [tests, setTests] = useState([]);

  const interviewerUsername = localStorage.getItem("interviewerUsername");

  const handleCancelTest = async (testId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tests/cancel/${testId}`);
      alert("Test cancelled successfully.");
      setTests(tests.filter((test) => test._id !== testId));
    } catch (error) {
      console.error("Error cancelling test:", error);
    }
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tests/interviewer/${interviewerUsername}`
        );
        setTests(response.data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchTests();
  }, [interviewerUsername]);

  return (
    <div
      className="tests-container"
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
        Your Created Tests
      </h2>

      {tests.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
          }}
        >
          No tests created yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tests.map((test, index) => (
            <li
              key={test._id}
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
              <strong
                style={{
                  color: "#333",
                  fontSize: "16px",
                }}
              >
                {`Test ${index + 1}`}
              </strong>
              <div>
                <button
                  onClick={() => handleCancelTest(test._id)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    (window.location.href = `/tests/results/${test._id}`)
                  }
                  style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  View Results
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create-test" style={{ textDecoration: "none" }}>
        <button
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Create New Test
        </button>
      </Link>
    </div>
  );
};

export default Tests;

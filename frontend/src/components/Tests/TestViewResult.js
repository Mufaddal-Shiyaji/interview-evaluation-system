import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TestViewResult = () => {
  const { testId } = useParams();
  const [results, setResults] = useState([]);
  const [testDetails, setTestDetails] = useState({
    interviewType: "",
    time: "",
    specificRequirements: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tests/results/${testId}`
        );
        setTestDetails(response.data.test);
        setResults(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching test results:", error);
        setLoading(false);
      }
    };
    fetchTestResults();
  }, [testId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="test-view-results"
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
        Results for {testDetails.interviewType}
      </h2>

      <p
        style={{
          fontSize: "16px",
          marginBottom: "10px",
          color: "#555",
        }}
      >
        Time: {testDetails.time} minutes
      </p>
      <p
        style={{
          fontSize: "16px",
          marginBottom: "20px",
          color: "#555",
        }}
      >
        Specific Requirements: {testDetails.specificRequirements}
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((result, index) => (
          <li
            key={index}
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
              {result.username}:
            </span>
            {result.completed ? (
              <a
                href={`http://localhost:5000/reports/Interview_${result.interviewId}.pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                View Result PDF
              </a>
            ) : (
              <span
                style={{
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Not Completed
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestViewResult;

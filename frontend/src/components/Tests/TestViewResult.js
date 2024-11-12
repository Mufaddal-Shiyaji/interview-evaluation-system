// components/TestViewResult.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TestViewResult = () => {
  const { testId } = useParams();
  const [results, setResults] = useState([]);
  const [testDetails, setTestDetails] = useState({
    subject: "",
    difficultyLevel: "",
    subTopic: "",
    time: "",
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
    <div className="test-view-results">
      <h2>
        Results for {testDetails.subject} - {testDetails.subTopic}
      </h2>
      <p>
        Difficulty: {testDetails.difficultyLevel} | Time: {testDetails.time}{" "}
        minutes
      </p>

      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <span>{result.username}: </span>
            {result.completed ? (
              <a
                href={`http://localhost:5000/reports/Interview_${result.interviewId}.pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }} // Optional styling to emphasize it's clickable
              >
                View Result PDF
              </a>
            ) : (
              <span>Not Completed</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestViewResult;

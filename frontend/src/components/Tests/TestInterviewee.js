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

  return (
    <div className="interviewee-tests">
      <h2>Your Tests</h2>
      {tests.length > 0 ? (
        <ul>
          {tests.map(({ test, completed, resultPDF }) => (
            <li key={test._id} className="test-item">
              <span>
                {test.subject} - {test.subTopic}
              </span>
              {completed ? (
                resultPDF ? (
                  <a href={resultPDF} target="_blank" rel="noopener noreferrer">
                    Completed
                  </a>
                ) : (
                  <span>Completed</span>
                )
              ) : (
                <button onClick={() => handleStartTest(test._id)}>Start</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tests found.</p>
      )}
    </div>
  );
};

const handleStartTest = (testId) => {
  // Redirect interviewee to the test-taking interface
  window.location.href = `/tests/${testId}/preview`;
};

export default IntervieweeTests;

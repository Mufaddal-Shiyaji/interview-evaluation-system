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
    <div className="tests-container">
      <h2>Your Created Tests</h2>
      {tests.length === 0 ? (
        <p>No tests created yet.</p>
      ) : (
        <ul>
          {tests.map((test, index) => (
            <li key={test._id}>
              {/* Display test number as 'Test 1', 'Test 2', etc. */}
              <strong>{`Test ${index + 1}`}</strong>
              <button onClick={() => handleCancelTest(test._id)}>Cancel</button>
              {/* Button to view results */}
              <button
                onClick={() =>
                  (window.location.href = `/tests/results/${test._id}`)
                }
                style={{ marginLeft: "10px" }}
              >
                View Results
              </button>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create-test">
        <button>Create New Test</button>
      </Link>
    </div>
  );
};

export default Tests;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const InterviewPage = () => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // Message input state
  const [isWhiteboardExpanded, setIsWhiteboardExpanded] = useState(false);
  const [whiteboardContent, setWhiteboardContent] = useState("");
  const [code, setCode] = useState("");
  const videoRef = useRef(null);
  const exitButtonRef = useRef(null);

  // Clipboard Restriction
  useEffect(() => {
    const handleCopy = (e) => e.preventDefault();
    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  const handleStartInterview = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsInterviewStarted(true);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) videoRef.current.srcObject = stream;
          })
          .catch((error) => console.error("Error accessing webcam:", error));
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      navigate("/interview-ended");
    }
  };

  const handleFinalSubmit = async () => {
    await axios.post("http://localhost:5000/api/interviews/submitInterview", {
      interviewId,
    });
    navigate("/interview-ended"); // Redirect to the interview-ended page
  };

  const handleExitInterview = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    navigate("/interview-ended");
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const userMessage = newMessage.trim();
    setChatMessages((prevMessages) => [...prevMessages, `You: ${userMessage}`]);
    setNewMessage(""); // Clear input field

    try {
      const response = await axios.post(
        "http://localhost:5000/api/interviews/sendMessage",
        {
          message: userMessage,
          question,
        }
      );
      const botMessage = response.data.message;
      setChatMessages((prevMessages) => [
        ...prevMessages,
        `Interviewer: ${botMessage}`,
      ]);
    } catch (error) {
      console.error("Error sending message to model:", error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        "Bot: Error sending message.",
      ]);
    }
  };

  useEffect(() => {
    const fetchInterviewAndTestDetails = async () => {
      try {
        const interviewResponse = await axios.get(
          `http://localhost:5000/api/interviews/get/${interviewId}`
        );
        const { testId } = interviewResponse.data;

        const testResponse = await axios.get(
          `http://localhost:5000/api/tests/getTest/${testId}`
        );
        const { time, subject, difficultyLevel, subTopic } = testResponse.data;

        setTimeLeft(time * 60);

        const questionResponse = await axios.post(
          "http://localhost:5000/api/interviews/generateQuestion",
          { subject, difficultyLevel, subTopic }
        );

        setQuestion(questionResponse.data.question);
        await axios.post(
          "http://localhost:5000/api/interviews/addQuestionToConversationHistory",
          { question: questionResponse.data.question }
        );
        // Add initial chat message from the interviewer
        setChatMessages([
          `Interviewer: Hey! Can you explain your approach to solving the given question?`,
        ]);
      } catch (error) {
        console.error("Error fetching interview or test data:", error);
        navigate("/interview-ended");
      }
    };

    fetchInterviewAndTestDetails();
  }, [interviewId, navigate]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleExitInterview();
      }
    };

    if (isInterviewStarted && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleExitInterview();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      document.addEventListener("fullscreenchange", onFullscreenChange);

      return () => {
        clearInterval(timer);
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }
  }, [isInterviewStarted, timeLeft]);

  const toggleWhiteboard = () => {
    setIsWhiteboardExpanded((prev) => !prev);
  };

  return (
    <div
      className="interview-page"
      style={{ display: "flex", height: "100vh" }}
    >
      {isInterviewStarted && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Time Left: {timeLeft} seconds
        </div>
      )}

      <div
        style={{
          width: "66.66%",
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
          }}
        >
          <h2>Question</h2>
          <p>{question}</p>
        </div>
        <div style={{ flex: 1, padding: "1rem", border: "1px solid #ddd" }}>
          <h2>Coding Area</h2>
          <textarea
            style={{ width: "100%", height: "100%", resize: "none" }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
          />
        </div>
      </div>

      <div
        style={{
          width: "33.33%",
          padding: "1rem",
          borderLeft: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 3,
            border: "1px solid #ddd",
            marginBottom: "1rem",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <h3>Chat</h3>
          <div>
            {chatMessages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ width: "80%", marginRight: "5px" }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>Camera</h3>
          <video
            ref={videoRef}
            style={{ width: "80%", height: "80%", borderRadius: "2px" }}
            autoPlay
          ></video>
        </div>

        <div
          style={{
            height: isWhiteboardExpanded ? "90vh" : "3rem",
            border: "1px solid #ddd",
            transition: "height 0.3s ease",
          }}
        >
          <button onClick={toggleWhiteboard} style={{ width: "100%" }}>
            {isWhiteboardExpanded ? "Minimize Whiteboard" : "Expand Whiteboard"}
          </button>
          {isWhiteboardExpanded && (
            <textarea
              style={{
                width: "100%",
                height: "calc(100% - 3rem)",
                padding: "0.5rem",
                border: "none",
                resize: "none",
                backgroundColor: "#f4f4f4",
              }}
              value={whiteboardContent}
              onChange={(e) => setWhiteboardContent(e.target.value)}
              placeholder="Write your rough work here..."
            />
          )}
        </div>
      </div>

      {timeLeft === null ? (
        <p>Loading interview details...</p>
      ) : !isInterviewStarted ? (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1>Ready to Start the Interview?</h1>
          <button onClick={handleStartInterview}>Start Interview</button>
        </div>
      ) : (
        <div style={{ position: "fixed", bottom: "10px", left: "10px" }}>
          <button ref={exitButtonRef} onClick={handleExitInterview}>
            Exit Interview
          </button>
          <button onClick={handleFinalSubmit}>Submit Interview</button>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;

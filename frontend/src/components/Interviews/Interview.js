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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalDisplayCount, setModalDisplayCount] = useState(0);
  const [defaulterCount, setDefaulterCount] = useState(0); // Initialize the counter
  const [modalMessage, setModalMessage] = useState("");
  const [code, setCode] = useState("");
  const videoRef = useRef(null);
  const exitButtonRef = useRef(null);
  const canvasRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [interviewType, setInterviewType] = useState("");
  const [mainTimer, setMainTimer] = useState("");
  const [roles, setRoles] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [count, setCount] = useState(0);
  // Initialize the component with interview details
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
        const { time, interviewType } = testResponse.data;

        const rolesArray = interviewType.split(",").map((role) => role.trim());
        setRoles(rolesArray);
        setMainTimer(time * 60); // Total time in seconds
        setTimeLeft((time * 60) / rolesArray.length); // Divide time per role

        await generateMainQuestion(rolesArray[0]);
      } catch (error) {
        console.error("Error fetching interview or test data:", error);
        navigate("/interview-ended");
      }
    };

    fetchInterviewAndTestDetails();
  }, [interviewId]);

  // Generate main question for the given role
  let isRequestInProgress = false;

  const generateMainQuestion = async (role) => {
    if (isRequestInProgress) return;
    isRequestInProgress = true;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/interviews/generateQuestion",
        { role }
      );
      setQuestion(response.data.question);

      if (count > 0 || currentRoleIndex > 0) {
        console.log("Inside the addAnotherQuestion");
        await axios.post(
          "http://localhost:5000/api/interviews/addAnotherQuestion",
          { question: response.data.question, role }
        );
      } else {
        setCount(count + 1);
        console.log("Inside the addConversationHistory");
        await axios.post(
          "http://localhost:5000/api/interviews/addQuestionToConversationHistory",
          { question: response.data.question }
        );
      }

      setChatMessages([
        `Interviewer: Hey! Can you explain your approach to solving the question for the role: ${role}?`,
      ]);
    } catch (error) {
      console.error("Error generating main question:", error);
    } finally {
      isRequestInProgress = false;
    }
  };

  // Handle moving to the next role
  const handleNextQuestion = async () => {
    if (isTransitioning) return; // Prevent double-triggering
    setIsTransitioning(true);

    if (currentRoleIndex < roles.length - 1) {
      const nextRole = roles[currentRoleIndex + 1];
      setCurrentRoleIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(mainTimer / roles.length); // Reset timer for the next role
      await generateMainQuestion(nextRole);
    } else {
      // All roles completed
      alert("Interview completed!");
      handleExitInterview();
    }

    setIsTransitioning(false);
  };

  const timerRef = useRef(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleExitInterview();
      }
    };

    if (isInterviewStarted && timeLeft !== null) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleNextQuestion();
            return mainTimer / roles.length;
          }
          return prevTime - 3;
        });
        console.log("timeLeft");
        if (timeLeft > 0) {
          captureAndVerifyScreenshot();
        }
      }, 3000);

      document.addEventListener("fullscreenchange", onFullscreenChange);

      return () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }
  }, [isInterviewStarted, mainTimer, roles.length]);
  //irrelevant for now

  const toggleWhiteboard = () => {
    setIsWhiteboardExpanded((prev) => !prev);
  };

  const captureAndVerifyScreenshot = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const imageBase64 = canvasRef.current.toDataURL("image/png");
      const intervieweeUsername = localStorage.getItem("intervieweeUsername");

      try {
        const response = await axios.post(
          "http://localhost:5000/api/interviews/verify",
          {
            username: intervieweeUsername,
            image: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
          }
        );

        if (!response.data.verified) {
          setDefaulterCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount >= 3) {
              showModal(
                "Verification failed: Please make sure you are the authorized user."
              );
              return 0; // Reset counter after showing the modal
            }
            return newCount;
          });

          // If modal has been displayed 4 times, exit the interview
          setModalDisplayCount((prevModalCount) => {
            const newModalCount = prevModalCount + 1;
            if (newModalCount >= 25) {
              exitInterview(); // Exit the interview after 4 modal displays
              return 0; // Reset the counter after exiting
            }
            return newModalCount;
          });
        } else {
          console.log("Verification passed");
          setDefaulterCount(0); // Reset the counter on successful verification
        }
      } catch (error) {
        console.error("Error verifying image:", error);
      }
    }
  };

  // Function to exit the interview
  const exitInterview = () => {
    alert(
      "You have been removed from the interview due to multiple failed verifications."
    );
    handleExitInterview();
  };

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
    handleExitInterview(); // Redirect to the interview-ended page
  };

  const handleExitInterview = async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    await axios.get("http://localhost:5000/api/interviews/clearChat");
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
        { message: userMessage } // Removed question as it's already in context
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

  // Show custom modal
  const showModal = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
  };

  // Hide custom modal
  const hideModal = () => {
    setIsModalVisible(false);
  };

  // Modal for verification failure
  const Modal = () => {
    if (!isModalVisible) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h3>{modalMessage}</h3>
          <button onClick={hideModal} style={{ padding: "10px 20px" }}>
            Close
          </button>
        </div>
      </div>
    );
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
          <button
            onClick={handleNextQuestion}
            disabled={currentRoleIndex >= roles.length - 1}
          >
            Next Question
          </button>
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
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            width="640"
            height="480"
          />
          <Modal />
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

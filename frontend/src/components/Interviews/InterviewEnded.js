const InterviewEnded = () => {
  return (
    <div
      style={{
        width: "60%",
        margin: "100px auto",
        padding: "30px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          color: "#333",
          marginBottom: "20px",
        }}
      >
        Interview Ended
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#555",
          lineHeight: "1.5",
        }}
      >
        Thank you for participating in the interview. You can now close this
        tab.
      </p>
    </div>
  );
};

export default InterviewEnded;

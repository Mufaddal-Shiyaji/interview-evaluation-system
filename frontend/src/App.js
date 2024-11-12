import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Tests from "./components/Tests/Tests";
import CreateTest from "./components/CreateTest/CreateTest";
import TestViewResult from "./components/Tests/TestViewResult";
import IntervieweeTests from "./components/Tests/TestInterviewee";
import InterviewPreview from "./components/Interviews/InterviewPreview";
import InterviewPage from "./components/Interviews/Interview";
import InterviewEnded from "./components/Interviews/InterviewEnded";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/tests/results/:testId" element={<TestViewResult />} />
        <Route path="/tests/interviewee/" element={<IntervieweeTests />} />
        <Route path="/tests/:testId/preview" element={<InterviewPreview />} />
        <Route path="/interview/:interviewId" element={<InterviewPage />} />
        <Route path="/interview-ended" element={<InterviewEnded />} />
      </Routes>
    </Router>
  );
}

export default App;

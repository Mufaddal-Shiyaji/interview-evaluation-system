import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Tests from "./components/Tests/Tests";
import CreateTest from "./components/CreateTest/CreateTest";
import TestViewResult from "./components/Tests/TestViewResult";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/tests/results/:testId" element={<TestViewResult />} />
      </Routes>
    </Router>
  );
}

export default App;

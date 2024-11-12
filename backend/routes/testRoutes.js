import express from "express";
import {
  getAllTestsForInterviewer,
  createTest,
  cancelTest,
  getTestResults,
  getAllTestsForInterviewee,
  getTest,
} from "../controllers/testController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/interviewer/:interviewerUsername", getAllTestsForInterviewer);
router.post("/create/:interviewerUsername", createTest);
router.delete("/cancel/:testId", cancelTest);
router.get("/results/:testId", getTestResults);
router.get("/interviewee/:intervieweeUsername", getAllTestsForInterviewee);
router.get("/getTest/:testId", getTest);

export default router;

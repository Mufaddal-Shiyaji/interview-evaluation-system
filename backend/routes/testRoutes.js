import express from "express";
import {
  getAllTestsForInterviewer,
  createTest,
  cancelTest,
  getTestResults,
} from "../controllers/testController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/interviewer/:interviewerUsername", getAllTestsForInterviewer);
router.post("/create/:interviewerUsername", createTest);
router.delete("/cancel/:testId", cancelTest);
router.get("/results/:testId", getTestResults);

export default router;

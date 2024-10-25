import express from "express";

import {
  interviewerSignUp,
  interviewerLogin,
  intervieweeSignUp,
  intervieweeLogin,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/interviewee/signup", intervieweeSignUp);
router.post("/interviewer/signup", interviewerSignUp);
router.post("/interviewee/login", intervieweeLogin);
router.post("/interviewer/login", interviewerLogin);
router.delete("/deleteUser", deleteUser);

export default router;

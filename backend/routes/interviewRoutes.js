import express from "express";

import {
  createInterview,
  getInterview,
  generateQuestion,
  sendMessage,
  addQuestionToConversationHistory,
  submitInterview,
  verify,
  clearChat,
} from "../controllers/interviewController.js";
const router = express.Router();

router.post("/create", createInterview);
router.get("/get/:interviewId", getInterview);
router.post("/generateQuestion", generateQuestion);
router.post("/sendMessage", sendMessage);
router.post(
  "/addQuestionToConversationHistory",
  addQuestionToConversationHistory
);
router.post("/submitInterview", submitInterview);
router.post("/verify", verify);
router.get("/clearChat", clearChat);
export default router;

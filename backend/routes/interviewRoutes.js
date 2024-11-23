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
  generateQuestionsForRoles,
  resetConversationForRole,
  addAnotherQuestion,
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
router.post("/generateQuestionsForRoles", generateQuestionsForRoles);
router.post("/resetConversationForRole", resetConversationForRole);
router.post("/addAnotherQuestion", addAnotherQuestion);
export default router;

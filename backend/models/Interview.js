import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  intervieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  completed: { type: Boolean, default: true }, // Whether the interview is completed
  resultPDF: { type: String, default: "" }, // Link to result PDF if completed

  audioInteractions: [
    {
      role: { type: String, enum: ["gpt", "candidate"], required: true },
      message: { type: String, required: true },
    },
  ],

  cheatingDetection: {
    type: Map,
    of: Boolean,
    default: {
      fullScreenViolation: false,
      clipboardViolation: false,
      lipSyncViolation: false,
      eyeballViolation: false,
      headMovementViolation: false,
      multipleFacesDetected: false,
      multipleVoicesDetected: false,
      deviceDetected: false,
      biometricMismatch: false,
      randomizedProblemCheck: false,
    },
  },

  parameterScores: {
    technicalSkill: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    problemSolving: { type: Number, min: 0, max: 10, default: 0 },
    codingEfficiency: { type: Number, min: 0, max: 10, default: 0 },
  },

  finalScore: { type: Number, min: 0, max: 10, default: 0 },
  reportSummary: { type: String },
});

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;

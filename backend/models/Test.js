// models/Test.js
import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  difficultyLevel: { type: String, required: true },
  subTopic: { type: String, required: true },
  time: { type: Number, required: true }, // Time in minutes
  specificRequirements: { type: String },
  createdByUsername: { type: String }, // Store username for readability
  studentUsernames: [{ type: String }], // Store usernames for readability
});

const Test = mongoose.model("Test", testSchema);
export default Test;

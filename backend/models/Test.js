// models/Test.js
import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  interviewType: { type: String, required: true },
  time: { type: Number, required: true },
  specificRequirements: { type: String },
  createdByUsername: { type: String },
  studentUsernames: [{ type: String }],
});

const Test = mongoose.model("Test", testSchema);
export default Test;

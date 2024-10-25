import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["interviewer", "interviewee"],
    required: true,
  },
  image: { type: String },
  company: { type: String },
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
});

const User = mongoose.model("User", userSchema);
export default User;

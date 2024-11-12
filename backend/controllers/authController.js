import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const interviewerSignUp = async (req, res) => {
  const { username, password, email, company } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "interviewer",
      company,
    });
    await user.save();
    res.status(201).json({ message: "Interviewer registered successfully" });
  } catch (error) {
    console.error("Error registering interviewer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Interviewee Signup
const intervieweeSignUp = async (req, res) => {
  const { username, password, email, image } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "interviewee",
      image,
    });
    await user.save();

    res.status(201).json({ message: "Interviewee registered successfully" });
  } catch (error) {
    console.error("Error registering interviewee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const interviewerLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username, role: "interviewer" });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ username, role: "interviewer" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      message: "Login successful",
      username: user.username, // Return username (or ID) to frontend
      token,
    });
  } else {
    res.status(401).send("Invalid credentials");
  }
};

const intervieweeLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username, role: "interviewee" });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ username, role: "interviewee" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", username: user.username, token });
  } else {
    res.status(401).send("Invalid credentials");
  }
};

const deleteUser = async (req, res) => {
  try {
    const username = req.body.username;
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: `User has been successfully deleted`,
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  intervieweeSignUp,
  interviewerLogin,
  interviewerSignUp,
  intervieweeLogin,
  deleteUser,
};

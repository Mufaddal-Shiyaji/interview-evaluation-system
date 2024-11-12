import Test from "../models/Test.js";
import User from "../models/User.js";
import Interview from "../models/Interview.js";
import axios from "axios";
import fetch from "node-fetch";
import { OpenAI } from "openai";

import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Function to generate a question based on test data
const generateQuestion = async (req, res) => {
  const { subject, difficultyLevel, subTopic } = req.body;

  try {
    const client = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1/",
      apiKey: process.env.HUGGING_FACE_API_KEY,
    });

    console.log("ssssppp");
    const c =
      "Normalization is a systematic process of organizing data within a database to minimize redundancy, ensure data integrity, and enhance efficiency. It involves breaking down large tables into smaller, more focused tables, establishing clear relationships between them. By adhering to specific normal forms, such as First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), Boyce-Codd Normal Form (BCNF), Fourth Normal Form (4NF), and Fifth Normal Form (5NF), database designers can eliminate anomalies like insertion, deletion, and update anomalies. 1NF ensures atomic values in each cell, 2NF eliminates partial dependencies of non-prime attributes on the primary key, 3NF removes transitive dependencies, BCNF strengthens 3NF by requiring every determinant to be a candidate key, 4NF addresses multi-valued dependencies, and 5NF handles join dependencies. Normalization offers numerous advantages, including reduced data redundancy, improved data consistency, enhanced query performance, and easier data maintenance. However, it can introduce complexity in database design and potentially increase storage requirements. In certain scenarios, denormalization, a controlled process of adding redundancy, may be necessary to optimize performance or simplify queries, but it should be applied judiciously to avoid compromising data integrity. Ultimately, normalization is a valuable tool for creating well-structured, efficient, and reliable databases. Based on this above answer by a candidate, can you give to the candidate scores on parameters of technicalSkill: { type: Number, min: 0, max: 10, default: 0 }, communication: { type: Number, min: 0, max: 10, default: 0 },problemSolving: { type: Number, min: 0, max: 10, default: 0 },codingEfficiency: { type: Number, min: 0, max: 10, default: 0 }, and an overall score for the candiate, give detail explanation of each score(basically make a report/marksheet for the candidate)";
    const m = `Generate an interview-level detailed question on '${subject}' focusing on '${subTopic}' with a difficulty level of '${difficultyLevel}'. (Do not generate anything else just give the question of length minimum 300 characters) (give an example if necessary)`;
    const response = await client.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        {
          role: "user",
          content: m,
        },
      ],
      min_tokens: 700,
      max_tokens: 2200,
    });
    res.json({ question: response.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Failed to generate question." });
  }
};

const createInterview = async (req, res) => {
  const { testId, interviewerUsername, intervieweeUsername } = req.body;
  console.log(testId, interviewerUsername, intervieweeUsername);

  try {
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    console.log(test);
    const interviewer = await User.findOne({ username: interviewerUsername });
    if (!interviewer)
      return res.status(404).json({ message: "Interviewer not found" });
    console.log(interviewer);
    const interviewee = await User.findOne({ username: intervieweeUsername });
    if (!interviewee)
      return res.status(404).json({ message: "Interviewee not found" });

    //console.log(interviewer._id, interviewee_.id);
    console.log(interviewer._id);
    const newInterview = new Interview({
      testId,
      interviewerId: interviewer._id,
      intervieweeId: interviewee._id,
    });

    await newInterview.save();
    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getInterview = async (req, res) => {
  const interviewId = req.params.interviewId;
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

let conversationHistory = [
  // Optionally, you can add the initial question as a system message here
  // { role: "system", content: `The interview is based on the following question: "${initialQuestion}"` }
];

const addQuestionToConversationHistory = async (req, res) => {
  const { question } = req.body;
  conversationHistory.push({
    role: "user",
    content: `You are a virtual interviewer. Engage the interviewee in a professional tone and ask relevant questions based on the candidate's responses. this is the question based on which the interview will revolve around: ${question}. All your response should be completed in less than 100 tokens`,
  });

  conversationHistory.push({
    role: "assistant",
    content: `Hey! Can you explain your approach to solving the given question?`,
  });
  res.status(200).json({ message: "Question added to conversation history." });
};

const sendMessage = async (req, res) => {
  const { message, question } = req.body;

  try {
    const client = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1/",
      apiKey: process.env.HUGGING_FACE_API_KEY,
    });

    // Add the user's latest message to the conversation history

    conversationHistory.push({ role: "user", content: message });
    const response = await client.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: conversationHistory,
      min_tokens: 30,
      max_tokens: 300,
    });

    // Extract the AI's response and add it to the conversation history
    const aiResponse = response.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Send the AI's response back to the client
    res.json({ message: aiResponse });
  } catch (error) {
    console.error("Error communicating with the AI model:", error);
    res.status(500).json({ error: "Failed to get response from the model." });
  }
};

const submitInterview = async (req, res) => {
  const { interviewId } = req.body;

  try {
    const client = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1/",
      apiKey: process.env.HUGGING_FACE_API_KEY,
    });

    // Request the LLM to generate a report based on specified parameters
    const reportPrompt = `
      Based on this interview conversation history, evaluate the candidate's performance on the following parameters:
      - Technical Skill: Rate out of 10
      - Communication: Rate out of 10
      - Problem Solving: Rate out of 10
      - Coding Efficiency: Rate out of 10

      Generate a detailed report with scores for each parameter, an overall score, and an explanation for each score.
    `;

    conversationHistory.push({ role: "user", content: reportPrompt });

    const response = await client.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1", // Or the model you are using
      messages: conversationHistory,
      max_tokens: 500,
    });

    const report = response.choices[0].message.content;
    conversationHistory = []; // Clear the conversation history

    // Fetch interview data and update status
    const interview = await Interview.findById(interviewId);
    interview.completed = true;
    interview.reportSummary = report;

    // Create a new PDF document
    const doc = new PDFDocument();
    const pdfFilePath = path.join(
      __dirname,
      "reports",
      `Interview_${interviewId}.pdf`
    );
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);

    // Design the PDF
    doc.fontSize(18).text("Interview Evaluation Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("Report Summary:");
    doc.moveDown().fontSize(10).text(report);

    // Finalize the document
    doc.end();

    // Wait for the write stream to finish
    writeStream.on("finish", async () => {
      // Save file path to the database
      interview.resultPDF = pdfFilePath;
      console.log(pdfFilePath);
      await interview.save();

      res
        .status(200)
        .json({ message: "Interview report generated successfully.", report });
    });

    writeStream.on("error", (error) => {
      console.error("Error writing PDF file:", error);
      res.status(500).json({ error: "Failed to save PDF report." });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report." });
  }
};

export {
  addQuestionToConversationHistory,
  sendMessage,
  generateQuestion,
  createInterview,
  getInterview,
  submitInterview,
};

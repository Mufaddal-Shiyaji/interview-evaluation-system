import Test from "../models/Test.js";
import User from "../models/User.js";
import Interview from "../models/Interview.js";
import { OpenAI } from "openai";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";
import axios from "axios";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Groq from "groq-sdk";

// Path to the prompt file
const promptFilePath = path.resolve(__dirname, "prompts/system.txt");
const promptContent = await readFile(promptFilePath, "utf8");

const reportFilePath = path.resolve(__dirname, "prompts/report.txt");
const reportContent = await readFile(reportFilePath, "utf8");

// Function to generate a question based on test data
const generateQuestion = async (req, res) => {
  const { subject, difficultyLevel, subTopic } = req.body;

  try {
    const client = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1/",
      apiKey: process.env.HUGGING_FACE_API_KEY,
    });

    console.log("ssssppp");
    const m = `Generate a detailed interview question on '${subject}' focusing on '${subTopic}' with a difficulty level of '${difficultyLevel}'. Provide only the question, with a minimum length of 300 characters. Do not include any explanations, context, or additional text.
    Format of the generation given below:

    ->
    [Question]
    `;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: m,
        },
      ],
      //model: "llama-3.2-90b-text-preview",
      model: "llama3-70b-8192",
      temperature: 0.86,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
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
  {
    role: "system",
    content: promptContent,
  },
];

const addQuestionToConversationHistory = async (req, res) => {
  const { question } = req.body;

  let systemContent = conversationHistory[0].content;
  systemContent += `From the next sentence, the main question will begin:  "${question}"`;
  conversationHistory[0].content = systemContent;

  res.status(200).json({ message: "Question added to conversation history." });
};

const sendMessage = async (req, res) => {
  const { message } = req.body;
  console.log(conversationHistory);

  try {
    // Add user's response to conversation history
    conversationHistory.push({ role: "user", content: message });
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      messages: conversationHistory,
      //model: "llama-3.2-90b-text-preview",
      model: "llama3-70b-8192",
      temperature: 0.86,
      max_tokens: 500,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const aiResponse = response.choices[0].message.content;

    // Add AI's next question to the conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    res.json({ message: aiResponse });
  } catch (error) {
    console.error("Error communicating with the AI model:", error);
    res.status(500).json({ error: "Failed to get response from the model." });
  }
};

const submitInterview = async (req, res) => {
  const { interviewId } = req.body;

  try {
    // Request the LLM to generate a report based on specified parameters
    const reportPrompt = reportContent;

    conversationHistory.push({ role: "user", content: reportPrompt });

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    const response = await groq.chat.completions.create({
      messages: conversationHistory,
      //model: "llama-3.2-90b-text-preview",
      model: "llama3-70b-8192",
      temperature: 0.86,
      max_tokens: 900,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const report = response.choices[0].message.content;
    conversationHistory = [];
    conversationHistory = [
      {
        role: "system",
        content: promptContent,
      },
    ]; // Clear the conversation history

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

    // Remove all '*' characters from the report
    const sanitizedReport = report.replace(/\*/g, "");
    doc.moveDown().fontSize(10).text(sanitizedReport);

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

const clearChat = async (req, res) => {
  conversationHistory = [];
  conversationHistory = [
    {
      role: "system",
      content: promptContent,
    },
  ];
  res.status(200).json({ message: "Chat history cleared." });
};

const verify = async (req, res) => {
  const { username, image: imageBase64 } = req.body;

  try {
    // Retrieve user data
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const storedImageBase64 = user.image;
    if (!storedImageBase64)
      return res
        .status(400)
        .json({ success: false, message: "No stored image found" });

    // Call the Flask backend to compare the images
    const response = await axios.post("http://localhost:4000/verifyFaceMatch", {
      storedImage: storedImageBase64,
      currentImage: imageBase64,
    });

    if (response.data.match) {
      res.json({ success: true, verified: true });
    } else {
      res.json({ success: false, verified: false });
    }
  } catch (error) {
    console.error("Error in verification:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export {
  addQuestionToConversationHistory,
  sendMessage,
  generateQuestion,
  createInterview,
  getInterview,
  submitInterview,
  verify,
  clearChat,
};

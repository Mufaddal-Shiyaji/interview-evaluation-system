import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
// import interviewRoutes from "./routes/interviewRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
// app.use("/api/interview", interviewRoutes);

export default app;

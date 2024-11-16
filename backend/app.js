import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(
  "/reports",
  express.static(path.join(__dirname, "/controllers/reports"))
);

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/interviews", interviewRoutes);

export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

import authRoutes from "./routes/auth";
import wordRoutes from "./routes/words";
import quizRoutes from "./routes/quiz";
import userRoutes from "./routes/users";
import dataRoutes from "./routes/data";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== "production";

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.toLowerCase();
      const isAllowed =
        allowedOrigins.some(
          (allowed) => normalizedOrigin === allowed.toLowerCase(),
        ) ||
        (isDev &&
          (normalizedOrigin.startsWith("http://localhost") ||
            normalizedOrigin.startsWith("http://127.0.0.1"))) ||
        (normalizedOrigin.includes("english-app-netspace") &&
          normalizedOrigin.endsWith("vercel.app")) ||
        // Chrome Extension support (LingoFlow Helper)
        normalizedOrigin.startsWith("chrome-extension://") ||
        normalizedOrigin.startsWith("moz-extension://");

      if (isAllowed) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "LingoFlow API is running!" });
});

// Unknown /api routes should return JSON instead of HTML
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// Start server
console.log(process.env.MONGODB_URI);
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

start();

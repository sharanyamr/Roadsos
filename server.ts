import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      // Use a consistent model for the chatbot
      const model = "gemini-3-flash-preview";
      
      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: "You are RoadSoS AI, an elite emergency response assistant. Your goal is to provide immediate, calm, and highly accurate guidance for road accidents, first aid, and emergency procedures. \n\nKey Responsibilities:\n1. Provide step-by-step first aid (CPR, bleeding control, fractures).\n2. Maintain a calm, professional tone.\n3. Recommend nearby medical facilities (conceptually).\n4. Support English, Hindi, and Kannada - automatically detect or respond in the requested language.\n5. Prioritize safety: Always remind users to stay safe and wait for professional help.\n\nKeep responses concise and well-structured using markdown.",
        },
        history: history || [],
      });

      const response = await chat.sendMessage({ message: prompt });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

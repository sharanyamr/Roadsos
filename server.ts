import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Gemini API setup
  const ai = new GoogleGenAI({
    apiKey: process.env.VITE_GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Routes
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, history } = req.body;

      // Validate API key
      if (!process.env.VITE_GEMINI_API_KEY) {
        return res.status(500).json({
          error: "VITE_GEMINI_API_KEY is not configured",
        });
      }

      // Validate prompt
      if (!prompt) {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      // Gemini model
      const model = "gemini-1.5-flash";

      // Create chat
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `
You are RoadSoS AI, an elite emergency response assistant.

Responsibilities:
1. Provide emergency guidance.
2. Give first aid instructions.
3. Stay calm and professional.
4. Support English, Hindi, and Kannada.
5. Keep responses concise and structured.
6. Prioritize user safety.

Always encourage contacting emergency services immediately.
          `,
        },
        history: history || [],
      });

      // Generate response
      const response = await chat.sendMessage({
        message: prompt,
      });

      res.json({
        text: response.text || "No response generated.",
      });
    } catch (error) {
      console.error("Gemini Error:", error);

      res.status(500).json({
        error: "Failed to generate AI response",
      });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
});

startServer();

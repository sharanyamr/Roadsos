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

  // Gemini Chat API
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, history } = req.body;

      // Validate API key
      if (!process.env.VITE_GEMINI_API_KEY) {
        return res.status(500).json({
          error: "Gemini API key is not configured",
        });
      }

      // Validate prompt
      if (!prompt) {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      // Gemini model
      const model = "gemini-2.0-flash";

      // Create chat
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `
You are RoadSoS AI, an advanced emergency response assistant.

Responsibilities:
1. Provide first aid guidance.
2. Help during road accidents.
3. Give calm emergency instructions.
4. Support English, Hindi, and Kannada.
5. Keep answers concise and actionable.
6. Always prioritize safety.

If emergency is severe:
- advise calling emergency services
- suggest moving to a safe location
- recommend nearby hospitals
          `,
        },
        history: history || [],
      });

      // Generate response
      const response = await chat.sendMessage({
        message: prompt,
      });

      res.json({
        text:
          response.text ||
          "Emergency assistance is currently limited. Please contact emergency services immediately.",
      });
    } catch (error) {
      console.error("Gemini Error:", error);

      res.status(500).json({
        text:
          "Emergency assistance is temporarily unavailable. Please call emergency services immediately.",
      });
    }
  });

  // Health route
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

// Start app
startServer().catch((err) => {
  console.error("Server startup error:", err);
});

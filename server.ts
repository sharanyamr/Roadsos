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

  // Gemini setup
  const ai = new GoogleGenAI({
    apiKey: process.env.VITE_GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "roadsos-ai",
      },
    },
  });

  // Gemini API Route
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, history } = req.body;

      if (!prompt) {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      if (!process.env.VITE_GEMINI_API_KEY) {
        return res.status(500).json({
          error: "Gemini API key missing",
        });
      }

      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: history || [],
        config: {
          systemInstruction: `
You are RoadSoS AI, an intelligent emergency response assistant.

Responsibilities:
- Provide emergency guidance
- Give first aid support
- Stay calm and concise
- Support English, Hindi, Kannada
- Prioritize user safety

Always recommend contacting emergency services during severe emergencies.
          `,
        },
      });

      const response = await chat.sendMessage({
        message: prompt,
      });

      return res.json({
        text:
          response.text ||
          "Emergency assistance is currently unavailable.",
      });
    } catch (error) {
      console.error("Gemini Error:", error);

      return res.status(500).json({
        text:
          "Emergency assistance is temporarily unavailable. Please contact emergency services.",
      });
    }
  });

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
    });
  });

  // Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    // Production
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

// Start application
startServer().catch((err) => {
  console.error("Server startup error:", err);
});

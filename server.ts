import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "RoadSoS server is running",
    });
  });

  // Emergency AI Route
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({
          error: "Prompt is required",
        });
      }

      const lower = prompt.toLowerCase();

      let aiResponse = "";

      // Bleeding
      if (lower.includes("bleeding")) {
        aiResponse = `
## Severe Bleeding Control

1. Apply direct pressure using a clean cloth.
2. Elevate the injured area if possible.
3. Do NOT remove embedded objects.
4. Keep the victim calm.
5. Call emergency services immediately (108).

Stay with the victim until responders arrive.
        `;
      }

      // Fracture
      else if (
        lower.includes("fracture") ||
        lower.includes("broken bone")
      ) {
        aiResponse = `
## Fracture Support

1. Do not move the injured limb.
2. Immobilize the affected area.
3. Apply ice wrapped in cloth.
4. Monitor swelling and bleeding.
5. Seek emergency medical help immediately.
        `;
      }

      // Unconscious
      else if (lower.includes("unconscious")) {
        aiResponse = `
## Unconscious Victim Procedure

1. Check breathing immediately.
2. If breathing, place victim in recovery position.
3. If not breathing, begin CPR.
4. Call emergency services (108).
5. Monitor continuously until help arrives.
        `;
      }

      // Accident
      else if (lower.includes("accident")) {
        aiResponse = `
## Road Accident Emergency Steps

1. Move to a safe location.
2. Turn on vehicle hazard lights.
3. Check for injuries.
4. Call emergency services (108).
5. Share your live location.
6. Avoid moving severely injured victims.
        `;
      }

      // Default
      else {
        aiResponse = `
## RoadSoS Emergency Guidance

1. Stay calm and assess the situation.
2. Contact emergency services (108).
3. Share your live location.
4. Apply first aid if trained.
5. Wait safely for responders.

RoadSoS emergency assistance is active.
        `;
      }

      return res.json({
        text: aiResponse,
      });

    } catch (error) {
      console.error("Server Error:", error);

      return res.status(500).json({
        text: `
Emergency assistance is active.

1. Call emergency services (108)
2. Move to a safe location
3. Share your live location
4. Apply first aid if trained
        `,
      });
    }
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

// Start application
startServer().catch((err) => {
  console.error("Server startup error:", err);
});

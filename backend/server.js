import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/ask-gpt", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Received request:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    console.log("📡 OpenAI response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.body.on("data", (chunk) => {
      console.log("🔹 Received chunk:", chunk.toString());
    });

    response.body.on("end", () => {
      console.log("✅ OpenAI stream ended");
    });

    response.body.on("error", (err) => {
      console.error("⚠️ Stream error:", err);
    });

    // Pipe OpenAI stream directly to client
    response.body.pipe(res);
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
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

    console.log("📩 Получен запрос от клиента:", prompt);

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

    console.log("📡 Ответ OpenAI status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка OpenAI:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.body.on("data", (chunk) => {
      console.log("🔹 Пришёл кусок от OpenAI:", chunk.toString());
    });

    response.body.on("end", () => {
      console.log("✅ OpenAI закончил стрим");
    });

    response.body.on("error", (err) => {
      console.error("⚠️ Ошибка в стриме OpenAI:", err);
    });

    // Прокидываем стрим в клиент
    response.body.pipe(res);
  } catch (error) {
    console.error("🔥 Ошибка на сервере:", error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Сервер запущен: http://localhost:${PORT}`));

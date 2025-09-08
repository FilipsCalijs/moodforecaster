"use client";

import { useState } from "react";

interface GPTStreamerProps {
  delay?: number; // задержка между токенами в мс
}

export default function GPTStreamer({ delay = 50 }: GPTStreamerProps) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!prompt) return;

    setAnswer("");
    setLoading(true);

    try {
      await getGPTAnswer(prompt, (token) => {
        setAnswer((prev) => prev + token);
      }, delay);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>GPT Стриминг</h1>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Введите вопрос GPT"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={handleClick}
        disabled={loading}
        style={{ padding: "8px 16px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Генерация..." : "Спросить GPT"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Ответ:</strong>
        <p style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "10px", minHeight: "100px" }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

// ------------------
// Функция для стриминга токенов
async function getGPTAnswer(
  prompt: string,
  onToken: (token: string) => void,
  delay = 50
) {
  console.log("🚀 Отправка запроса:", prompt);

  const res = await fetch("http://localhost:3001/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Ошибка сервера:", text);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    console.error("⚠️ Поток недоступен");
    return;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.replace(/^data:\s*/, "");
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const token = json.choices[0]?.delta?.content;
        if (token) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          onToken(token);
        }
      } catch {
        // игнорируем служебные строки
      }
    }
  }
}

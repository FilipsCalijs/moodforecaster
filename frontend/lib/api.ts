export async function getGPTAnswer(
  prompt: string,
  onToken: (token: string) => void,
  delay = 50 // задержка в миллисекундах между токенами
) {
  const res = await fetch("http://localhost:3001/ask-gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Ошибка от сервера:", text);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) return;

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
          // Добавляем искусственную задержку
          await new Promise((resolve) => setTimeout(resolve, delay));
          onToken(token);
        }
      } catch {
        // игнорируем служебные строки
      }
    }
  }
}

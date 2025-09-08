import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // чтобы прочитать API_KEY из .env

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function askGPT(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Ты помощник." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

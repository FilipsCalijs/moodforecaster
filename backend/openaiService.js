import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Send a prompt to GPT and return the response
export async function askGPT(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an assistant." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}
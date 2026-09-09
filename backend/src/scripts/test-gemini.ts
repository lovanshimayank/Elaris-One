import "dotenv/config";
import { generateAIResponse } from "../services/ai/gemini.service";

async function main() {
  try {
    const response = await generateAIResponse("Hello, what is the weather today?");
    console.log("AI response:", response);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();


import { callLLM } from "../llmRouter.js";

async function main() {
  const OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY"; // Replace with your actual API key

  if (OPENROUTER_API_KEY === "YOUR_OPENROUTER_API_KEY") {
    console.error("Please replace 'YOUR_OPENROUTER_API_KEY' with your actual OpenRouter API key.");
    return;
  }

  try {
    const response = await callLLM({
      provider: "openrouter",
      modelName: "mistralai/mistral-7b-instruct", // Example model, choose one available on OpenRouter
      apiKey: OPENROUTER_API_KEY,
      messages: [
        { role: "user", content: "What is the capital of France?" },
      ],
      temperature: 0.7,
    });
    console.log("OpenRouter Response:", response);
  } catch (error) {
    console.error("Error calling OpenRouter LLM:", error);
  }
}

main();

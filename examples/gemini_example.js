import { callLLM } from '../llmRouter.js';

async function main() {
    const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual Gemini API key

    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        console.error("Please replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API key.");
        return;
    }

    try {
        const response = await callLLM({
            provider: "gemini",
            modelName: "gemini-pro", // Or another Gemini model like "gemini-1.5-pro"
            apiKey: GEMINI_API_KEY,
            messages: [
                { role: "user", content: "What is the capital of France?" }
            ],
            temperature: 0.7
        });
        console.log("Gemini Response:", response);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
    }
}

main();

import { callLLM } from '../llmRouter.js';

async function main() {
    const openaiApiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual OpenAI API key

    if (openaiApiKey === "YOUR_OPENAI_API_KEY") {
        console.warn("Please replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key.");
        return;
    }

    try {
        const response = await callLLM({
            provider: "openai",
            modelName: "gpt-3.5-turbo", // Or any other OpenAI model
            apiKey: openaiApiKey,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "What is the capital of France?" }
            ],
            temperature: 0.7,
            user: "test-user-123"
        });
        console.log("OpenAI Response:", response);
    } catch (error) {
        console.error("Error calling OpenAI LLM:", error.message);
    }
}

main();

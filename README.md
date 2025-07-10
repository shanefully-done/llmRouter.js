# llmRouter.js

The llmRouter.js is a centralized library designed to provide a unified interface for interacting with various Large Language Model (LLM) providers. It abstracts away the complexities of individual API endpoints, request formats, and response parsing, allowing your applications and plugins to make LLM calls with a consistent and simplified API.

## Features

- **Unified API:** A single `callLLM` function to interact with different LLM providers.
- **Provider Support:** Currently supports OpenAI, Gemini, and OpenRouter.
- **Centralized Management:** Simplifies API key management and request handling.
- **Error Handling:** Built-in error handling for API responses.

## Usage

### Importing `callLLM`

First, import the `callLLM` function into your file. The path will vary depending on your file's location relative to `lib/llmRouter.js`. For files located in `index.js`, the import path will typically be:

```javascript
import { callLLM } from "./lib/llmRouter.js";
```

### `LLMParams` Type Definition

The `callLLM` function expects an object conforming to the `LLMParams` type:

```javascript
/**
 * @typedef {object} LLMParams
 * @property {"openai" | "gemini" | "openrouter"} provider - The LLM provider to use.
 * @property {string} modelName - The name of the model to use.
 * @property {string} apiKey - The API key for the selected provider.
 * @property {{ role: string; content: string }[]} messages - An array of message objects.
 * @property {number} [temperature] - The sampling temperature to use.
 * @property {string} [user] - A unique identifier for the end-user.
 * @property {object[]} [tools] - (OpenAI only) An array of tool definitions for function calling.
 * @property {object} [response_format] - (OpenAI only) Specifies the format of the model's response.
 */
```

### Basic `callLLM` Example (Gemini/OpenRouter)

For providers like Gemini or OpenRouter, the usage is straightforward. Prepare your messages array with `role` and `content` properties. System instructions should be included as a message with `role: 'system'`.

```javascript
import { callLLM } from "./lib/llmRouter.js";

async function getSummary(chatLog, senderName) {
	const geminiApiKey = process.env.GEMINI_API.replace(/^"|"$/g, "");
	const modelName = "gemini-pro";
	const currentTime = new Date().toISOString();

	const messages = [
		{
			role: "system",
			content: `You are a helpful assistant. Current time: ${currentTime}. Sender: ${senderName}`,
		},
		{
			role: "user",
			content: `Please summarize the following chat log:\n${chatLog}`,
		},
	];

	try {
		const summary = await callLLM({
			provider: "gemini",
			modelName: modelName,
			apiKey: geminiApiKey,
			messages: messages,
			temperature: 0.7, // Optional
			user: Buffer.from(senderName).toString("base64"), // Optional
		});
		console.log("Summary:", summary);
		return summary;
	} catch (error) {
		console.error("Error calling LLM:", error.message);
		throw error;
	}
}
```

### OpenAI Specific Features: `tools` and `response_format`

The `callLLM` function supports OpenAI's advanced features like `tools` (for function calling) and `response_format` (for structured outputs like JSON). These parameters are only relevant for the `"openai"` provider.

#### Example with `tools` (Function Calling)

```javascript
import { callLLM } from "./lib/llmRouter.js";

async function determineSearchNecessity(
	userQuestion,
	currentDateTime,
	senderName
) {
	const openaiApiKey = process.env.OPENAI_API;
	const modelName = "gpt-4o-mini";

	const messages = [
		{
			role: "system",
			content: `Determine if the user's question requires real-time or recent information that would necessitate a web search. Current date and time: ${currentDateTime}.`,
		},
		{ role: "user", content: userQuestion },
	];

	const tools = [
		{
			type: "function",
			function: {
				name: "determine_search_necessity",
				description: "Returns true if question needs current data or web search",
				parameters: {
					type: "object",
					properties: {
						response: {
							type: "boolean",
							description: "True if search needed, false if not",
						},
					},
					required: ["response"],
				},
			},
		},
	];

	try {
		// callLLM will return the parsed function arguments if a tool call is made
		const decision = await callLLM({
			provider: "openai",
			modelName: modelName,
			apiKey: openaiApiKey,
			messages: messages,
			tools: tools,
			temperature: 0,
			user: Buffer.from(senderName).toString("base64"),
		});
		console.log("Search needed:", decision);
		return decision;
	} catch (error) {
		console.error("Error determining search necessity:", error.message);
		throw error;
	}
}
```

#### Example with `response_format` (JSON Schema)

```javascript
import { callLLM } from "./lib/llmRouter.js";

async function getStructuredResponse(prompt, senderName) {
	const openaiApiKey = process.env.OPENAI_API;
	const modelName = "gpt-4o-mini";

	const messages = [
		{
			role: "system",
			content: "You are a helpful assistant that outputs JSON.",
		},
		{ role: "user", content: prompt },
	];

	const response_format = {
		type: "json_object",
		json_schema: {
			name: "structured_output",
			schema: {
				type: "object",
				properties: {
					item: { type: "string" },
					quantity: { type: "number" },
					unit: { type: "string" },
				},
				required: ["item", "quantity", "unit"],
			},
			strict: true,
		},
	};

	try {
		// callLLM will return the JSON string directly
		const jsonResponse = await callLLM({
			provider: "openai",
			modelName: modelName,
			apiKey: openaiApiKey,
			messages: messages,
			response_format: response_format,
			temperature: 0,
			user: Buffer.from(senderName).toString("base64"),
		});
		const parsedResponse = JSON.parse(jsonResponse);
		console.log("Parsed JSON:", parsedResponse);
		return parsedResponse;
	} catch (error) {
		console.error("Error getting structured response:", error.message);
		throw error;
	}
}
```

## Error Handling

The `callLLM` function handles API errors internally and throws a descriptive `Error` object if a request fails or the provider is unsupported. It is recommended to wrap your `callLLM` calls in `try...catch` blocks to handle these errors gracefully.

## Contribution

Feel free to contribute to this llmRouter.js by adding support for new providers or enhancing existing functionalities.

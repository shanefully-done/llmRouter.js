/**
 * @typedef {object} LLMParams
 * @property {"openai" | "gemini" | "openrouter"} provider - The LLM provider to use.
 * @property {string} modelName - The name of the model to use.
 * @property {string} apiKey - The API key for the selected provider.
 * @property {{ role: string; content: string }[]} messages - An array of message objects.
 * @property {number} [temperature] - The sampling temperature to use.
 * @property {string} [user] - A unique identifier for the end-user.
 */

/**
 * Calls the appropriate LLM based on the provider specified in the parameters.
 * @param {LLMParams} params - The parameters for the LLM call.
 * @returns {Promise<string>} A promise that resolves with the LLM's response.
 * @throws {Error} If the provider is unsupported or an API error occurs.
 */
async function callLLM(params) {
	switch (params.provider) {
		case "openai":
			return callOpenAI(params);
		case "gemini":
			return callGemini(params);
		case "openrouter":
			return callOpenRouter(params);
		default:
			throw new Error(`Unsupported provider: ${params.provider}`);
	}
}

/**
 * Calls the OpenAI API.
 * @param {LLMParams} params - The parameters for the OpenAI call.
 * @returns {Promise<string>} A promise that resolves with the OpenAI's response.
 * @throws {Error} If an OpenAI API error occurs.
 */
async function callOpenAI(params) {
	const gptOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: params.apiKey,
		},
	};

	const postData = JSON.stringify({
		model: params.modelName,
		messages: params.messages,
		tools: params.tools,
		response_format: params.response_format,
		temperature: params.temperature,
		user: Buffer.from(params.user ?? "").toString("base64"),
	});

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		...gptOptions,
		body: postData,
	});

	if (!response.ok) {
		throw new Error(
			`OpenAI API error: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (data.choices[0].message.content !== null) {
		return data.choices[0].message.content;
	} else if (data.choices[0].message.tool_calls[0].function.arguments !== null) {
		return JSON.parse(data.choices[0].message.tool_calls[0].function.arguments)
			.response;
	} else {
		return null;
	}
}

/**
 * Calls the Gemini API.
 * @param {LLMParams} params - The parameters for the Gemini call.
 * @returns {Promise<string>} A promise that resolves with the Gemini's response.
 * @throws {Error} If a Gemini API error occurs.
 */
async function callGemini(params) {
	const geminiOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	};

	const postData = JSON.stringify({
		contents: [
			{
				parts: [
					{
						text: params.messages.map((m) => `[${m.role}] ${m.content}`).join("\n"),
					},
				],
			},
		],
	});

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${params.modelName}:generateContent?key=${params.apiKey}`,
		{
			...geminiOptions,
			body: postData,
		}
	);

	if (!response.ok) {
		throw new Error(
			`Gemini API error: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();
	return data.candidates[0].content.parts[0].text;
}

/**
 * Calls the OpenRouter API.
 * @param {LLMParams} params - The parameters for the OpenRouter call.
 * @returns {Promise<string>} A promise that resolves with the OpenRouter's response.
 * @throws {Error} If an OpenRouter API error occurs.
 */
async function callOpenRouter(params) {
	const openRouterOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${params.apiKey}`,
		},
	};

	const postData = JSON.stringify({
		model: params.modelName,
		messages: params.messages,
		tools: params.tools,
		response_format: params.response_format,
		temperature: params.temperature,
		user: Buffer.from(params.user ?? "").toString("base64"),
	});

	const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		...openRouterOptions,
		body: postData,
	});

	if (!response.ok) {
		throw new Error(
			`OpenRouter API error: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();
	return data.choices[0].message.content;
}

export { callLLM };

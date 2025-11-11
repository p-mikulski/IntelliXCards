# OpenRouter Service: Implementation Guide

This document provides a comprehensive guide for implementing the `OpenRouterService` in TypeScript. The service will act as a client for the OpenRouter API, facilitating LLM-based chat completions.

## 1. Service Description

The `OpenRouterService` is a TypeScript class designed to provide a simple and robust interface for interacting with the OpenRouter API. It will handle the construction of API requests, manage authentication, send requests, and parse responses. The primary goal is to abstract the complexity of the OpenRouter API, offering a clean `chatCompletion` method that developers can easily integrate into the application. The service will support key features like system messages, user messages, structured JSON responses, and dynamic model selection.

## 2. Constructor Description

The service will be initialized with a configuration object. This approach ensures that the service is flexible and that sensitive information like API keys is handled securely.

```typescript
interface OpenRouterServiceConfig {
  apiKey: string;
}

class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";

  constructor(config: OpenRouterServiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.apiKey = config.apiKey;
  }

  // ... methods
}
```

The constructor will take a single `config` object containing the `apiKey`. It will perform a runtime check to ensure the API key is provided and throw an error if it's missing.

## 3. Public Methods and Fields

The service will expose one primary public method.

### `public async chatCompletion<T>(params: ChatCompletionParams): Promise<T>`

This method is the main entry point for making a chat completion request.

- **`params`**: An object of type `ChatCompletionParams` containing all necessary information for the API call.
  ```typescript
  interface ChatCompletionParams {
    model: string;
    systemMessage?: string;
    userMessage: string;
    response_format?: {
      type: "json_object"; // Note: OpenRouter uses 'json_object'
    };
    temperature?: number;
    max_tokens?: number;
  }
  ```
- **Returns**: A `Promise<T>` that resolves with the parsed content from the model's response. The generic type `T` allows for strong typing of structured JSON responses.

## 4. Private Methods and Fields

The internal logic will be broken down into several private methods to adhere to the single-responsibility principle.

### `private readonly apiKey: string`

Stores the OpenRouter API key provided during instantiation.

### `private readonly baseUrl: string`

Stores the base URL for the OpenRouter API.

### `private buildRequestPayload(params: ChatCompletionParams): object`

This method will construct the JSON payload for the API request. It will assemble the `messages` array from the system and user messages and include any other specified parameters like `model`, `temperature`, and `response_format`.

### `private async sendRequest<T>(payload: object): Promise<T>`

This method handles the actual HTTP POST request to the OpenRouter API using the `fetch` API. It will set the required headers, including `Authorization` for the API key and `Content-Type`. It will also contain the core error handling logic, checking the HTTP status code and parsing the response body for API-specific errors.

## 5. Error Handling

Robust error handling is critical for a service that communicates over the network. The service will handle the following scenarios:

1.  **Configuration Errors**: The constructor will throw an error if the API key is not provided.
2.  **Network Errors**: The `sendRequest` method will wrap the `fetch` call in a `try...catch` block to handle network failures (e.g., no internet connection).
3.  **HTTP Errors**: The `sendRequest` method will check if `response.ok` is `false`. If it is, it will parse the JSON error response from the API and throw a custom, more informative error (e.g., `OpenRouterAPIError`) that includes the status code and error message from the API.
4.  **Response Parsing Errors**: If the API response is not valid JSON (when it's expected to be), the `.json()` call will fail. This will be caught and re-thrown as a specific error, indicating a malformed response from the API.

## 6. Security Considerations

1.  **API Key Management**: The API key must **never** be hardcoded in the source code or exposed on the client side. It should be stored securely as an environment variable (`OPENROUTER_API_KEY`) on the server. The service will be instantiated on the server (e.g., within an Astro API route) where the environment variable can be accessed safely.
2.  **Input Validation**: While this service doesn't perform business logic validation, the calling code (e.g., API endpoints) should use a library like `zod` to validate any user-provided input before it is passed to the `OpenRouterService`. This prevents invalid data from being sent to the API.

## 7. Step-by-Step Implementation Plan

This plan is tailored to the project's tech stack (TypeScript, Astro).

### Step 1: Create the Service File

Create a new file at `src/lib/services/openrouter.service.ts`.

### Step 2: Define Types and Interfaces

At the top of the file, define the necessary interfaces for configuration and parameters.

```typescript
// src/lib/services/openrouter.service.ts

export interface OpenRouterServiceConfig {
  apiKey: string;
}

export interface ChatCompletionParams {
  model: string;
  systemMessage?: string;
  userMessage: string;
  response_format?: { type: "json_object" };
  temperature?: number;
  max_tokens?: number;
}

// Define a custom error for better error handling
export class OpenRouterAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = "OpenRouterAPIError";
  }
}
```

### Step 3: Implement the Class Skeleton and Constructor

Implement the `OpenRouterService` class with its constructor as described in Section 2.

```typescript
// src/lib/services/openrouter.service.ts
// ... (imports and interfaces)

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";

  constructor(config: OpenRouterServiceConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.apiKey = config.apiKey;
  }

  // ... methods will go here
}
```

### Step 4: Implement the Private `buildRequestPayload` Method

This method translates the user-friendly `ChatCompletionParams` into the format required by the OpenRouter API.

```typescript
// Inside OpenRouterService class

private buildRequestPayload(params: ChatCompletionParams): object {
  const messages: { role: string; content: string }[] = [];

  if (params.systemMessage) {
    messages.push({ role: "system", content: params.systemMessage });
  }

  messages.push({ role: "user", content: params.userMessage });

  const payload: any = {
    model: params.model,
    messages,
  };

  if (params.response_format) {
    payload.response_format = params.response_format;
  }
  if (params.temperature) {
    payload.temperature = params.temperature;
  }
  if (params.max_tokens) {
    payload.max_tokens = params.max_tokens;
  }

  return payload;
}
```

### Step 5: Implement the Private `sendRequest` Method

This method will contain the core networking and error handling logic.

```typescript
// Inside OpenRouterService class

private async sendRequest<T>(payload: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Network or other fetch-related errors
    throw new OpenRouterAPIError("Failed to connect to OpenRouter API.", 500, error);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error?.message || "An unknown API error occurred.";
    throw new OpenRouterAPIError(errorMessage, response.status, errorBody);
  }

  const data = await response.json();
  return data;
}
```

### Step 6: Implement the Public `chatCompletion` Method

This method orchestrates the private methods to execute a request.

```typescript
// Inside OpenRouterService class

public async chatCompletion<T>(params: ChatCompletionParams): Promise<T> {
  const payload = this.buildRequestPayload(params);
  const response = await this.sendRequest<any>(payload);

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new OpenRouterAPIError("Invalid response: No content received from API.", 500, response);
  }

  // If JSON mode was requested, parse the content. Otherwise, return as is.
  if (params.response_format?.type === "json_object") {
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new OpenRouterAPIError("Failed to parse JSON response from model.", 500, content);
    }
  }

  return content as T;
}
```

### Step 7: Add Environment Variable

Add the `OPENROUTER_API_KEY` to your project's `.env` file. Remember to add `.env` to your `.gitignore` file.

```
# .env
OPENROUTER_API_KEY="your-api-key-here"
```

### Step 8: Example Usage in an Astro API Route

Here is how you would use the service in an Astro API endpoint (e.g., `src/pages/api/generate.ts`).

```typescript
// src/pages/api/generate.ts
import type { APIRoute } from "astro";
import { OpenRouterService } from "../../lib/services/openrouter.service";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  // Basic validation
  if (!body.prompt) {
    return new Response(JSON.stringify({ error: "Prompt is required." }), { status: 400 });
  }

  // Instantiate the service on the server, using the environment variable
  const openRouter = new OpenRouterService({
    apiKey: import.meta.env.OPENROUTER_API_KEY,
  });

  try {
    // Example of a structured response request
    interface Flashcard {
      question: string;
      answer: string;
    }

    const flashcard = await openRouter.chatCompletion<Flashcard>({
      model: "openai/gpt-3.5-turbo",
      systemMessage: "You are a helpful assistant that creates flashcards. Respond with only the JSON object.",
      userMessage: `Create a flashcard for the term: ${body.prompt}`,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    // Return a generic error to the client
    return new Response(JSON.stringify({ error: "Failed to generate completion." }), { status: 500 });
  }
};
```

import { z } from "zod";
import type { FlashcardDraft, GenerateFlashcardsCommand } from "../../types";

export interface FlashcardGenerationServiceConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatCompletionParams {
  model: string;
  systemMessage?: string;
  userMessage: string;
  response_format?: {
    type: "json_object";
  };
  temperature?: number;
  max_tokens?: number;
}

const flashcardDraftSchema = z.object({
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().min(1).max(1200),
});

const flashcardGenerationResponseSchema = z.object({
  flashcards: z.array(flashcardDraftSchema).min(1),
});

export const generateFlashcardsSchema = z.object({
  text: z.string().max(10000, "Text cannot exceed 10,000 characters"),
  desired_count: z.number().int().positive().max(100, "Cannot generate more than 100 flashcards at once"),
});

export class OpenRouterAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "OpenRouterAPIError";
  }
}

export class FlashcardGenerationService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly maxRetries = 2;
  private readonly retryBackoffMs = 200;

  constructor(config: FlashcardGenerationServiceConfig = {}) {
    const envApiKey = typeof import.meta !== "undefined" ? import.meta.env.OPENROUTER_API_KEY : "";
    const envModel = typeof import.meta !== "undefined" ? import.meta.env.OPENROUTER_MODEL : "";

    this.apiKey = (config.apiKey ?? envApiKey ?? "").trim();
    this.model = config.model ?? envModel ?? "deepseek/deepseek-chat-v3.1:free";
    this.temperature = config.temperature ?? 0.4;
    this.maxTokens = config.maxTokens ?? 1500;
  }

  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<FlashcardDraft[]> {
    const { text, desired_count } = command;
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return [];
    }

    if (!this.hasApiKey()) {
      return this.generateMockFlashcards(trimmedText, desired_count);
    }

    try {
      const completion = await this.chatCompletion<unknown>(this.buildGenerationRequest(trimmedText, desired_count));

      return this.parseFlashcardsResponse(completion, desired_count);
    } catch (error) {
      if (error instanceof OpenRouterAPIError) {
        throw error;
      }

      throw new OpenRouterAPIError("Failed to generate flashcards using OpenRouter.", 500, error);
    }
  }

  async regenerateFlashcard(flashcardId: string): Promise<FlashcardDraft> {
    if (!this.hasApiKey()) {
      return {
        front: `Regenerated question for flashcard ${flashcardId}`,
        back: `Regenerated answer for flashcard ${flashcardId}`,
      };
    }

    try {
      const completion = await this.chatCompletion<unknown>(this.buildRegenerationRequest(flashcardId));

      return this.parseSingleFlashcardResponse(completion);
    } catch (error) {
      if (error instanceof OpenRouterAPIError) {
        throw error;
      }

      throw new OpenRouterAPIError("Failed to regenerate flashcard using OpenRouter.", 500, error);
    }
  }

  private hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  private buildGenerationRequest(text: string, desiredCount: number): ChatCompletionParams {
    const safeCount = Math.max(1, Math.min(desiredCount, 100));

    return {
      model: this.model,
      systemMessage:
        "You are an expert instructor that creates high-quality study flashcards. " +
        "Return only valid JSON. Each flashcard must include a short question in 'front' and a concise, factual answer in 'back'.",
      userMessage: [
        "Generate flashcards with the following requirements:",
        JSON.stringify({ desired_count: safeCount, text }),
        'Respond with JSON exactly in this shape: {"flashcards":[{"front":string,"back":string}]}.',
        "Do not include any additional keys or commentary.",
      ].join("\n\n"),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    };
  }

  private buildRegenerationRequest(flashcardId: string): ChatCompletionParams {
    return {
      model: this.model,
      systemMessage:
        "You are an expert educator who refreshes flashcards. Return only valid JSON with a single flashcard entry.",
      userMessage: [
        "Regenerate a single flashcard. Use the following identifier to understand the context:",
        JSON.stringify({ flashcardId }),
        'Return JSON exactly in this shape: {"flashcards":[{"front":string,"back":string}]}.',
      ].join("\n\n"),
      temperature: this.temperature,
      max_tokens: Math.min(this.maxTokens, 400),
    };
  }

  private async chatCompletion<T>(params: ChatCompletionParams): Promise<T> {
    if (!this.hasApiKey()) {
      throw new OpenRouterAPIError("OpenRouter API key is not configured.", 401);
    }

    const payload = this.buildRequestPayload(params);
    const response = await this.sendRequest<{ choices?: { message?: { content?: string } }[] }>(payload);
    const content = response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new OpenRouterAPIError("Invalid response: No content received from API.", 500, response);
    }

    // Extract JSON from content (some models wrap it in <think> tags or other markup)
    const jsonContent = this.extractJsonFromContent(content);

    try {
      return JSON.parse(jsonContent) as T;
    } catch (error) {
      throw new OpenRouterAPIError("Failed to parse JSON response from model.", 500, {
        rawContent: content,
        cause: error,
      });
    }
  }

  private buildRequestPayload(params: ChatCompletionParams): Record<string, unknown> {
    const messages: { role: string; content: string }[] = [];

    if (params.systemMessage) {
      messages.push({ role: "system", content: params.systemMessage });
    }

    messages.push({ role: "user", content: params.userMessage });

    const payload: Record<string, unknown> = {
      model: params.model,
      messages,
    };

    if (typeof params.temperature === "number") {
      payload.temperature = params.temperature;
    }

    if (typeof params.max_tokens === "number") {
      payload.max_tokens = params.max_tokens;
    }

    if (params.response_format) {
      payload.response_format = params.response_format;
    }

    return payload;
  }

  private async sendRequest<T>(payload: Record<string, unknown>, attempt = 1): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (attempt <= this.maxRetries) {
        await this.delay(this.retryBackoffMs * attempt);
        return this.sendRequest<T>(payload, attempt + 1);
      }

      throw new OpenRouterAPIError("Failed to connect to OpenRouter API.", 500, error);
    }

    if (!response.ok) {
      const errorBody = await this.safeParseJson(response);
      const errorMessage =
        this.extractErrorMessage(errorBody) || response.statusText || "An unknown API error occurred.";

      if (this.shouldRetryStatus(response.status, attempt)) {
        await this.delay(this.retryBackoffMs * attempt);
        return this.sendRequest<T>(payload, attempt + 1);
      }

      throw new OpenRouterAPIError(errorMessage, response.status, errorBody);
    }

    return (await this.safeParseJson(response)) as T;
  }

  private extractErrorMessage(body: unknown): string | undefined {
    if (!body || typeof body !== "object") {
      return undefined;
    }

    if ("error" in body) {
      const errorField = (body as { error?: unknown }).error;

      if (errorField && typeof errorField === "object" && "message" in errorField) {
        const message = (errorField as { message?: unknown }).message;

        if (typeof message === "string") {
          return message;
        }
      }
    }

    if ("message" in body) {
      const message = (body as { message?: unknown }).message;

      if (typeof message === "string") {
        return message;
      }
    }

    return undefined;
  }

  private shouldRetryStatus(status: number, attempt: number): boolean {
    if (attempt > this.maxRetries) {
      return false;
    }

    return status === 429 || (status >= 500 && status < 600);
  }

  private async safeParseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (error) {
      throw new OpenRouterAPIError("Failed to parse response from OpenRouter API.", response.status, error);
    }
  }

  private delay(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }

  private extractJsonFromContent(content: string): string {
    // Remove <think> tags if present (used by some models like DeepSeek)
    const thinkTagPattern = /<think>[\s\S]*?<\/think>/gi;
    const cleaned = content.replace(thinkTagPattern, "").trim();

    // Try to find JSON object in the content
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    // If no JSON object found, return cleaned content
    return cleaned;
  }

  private parseFlashcardsResponse(data: unknown, desiredCount: number): FlashcardDraft[] {
    const parsed = flashcardGenerationResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new OpenRouterAPIError(
        "Invalid flashcard response structure from OpenRouter.",
        500,
        parsed.error.flatten()
      );
    }

    return parsed.data.flashcards.slice(0, desiredCount).map((card) => ({
      front: card.front.trim(),
      back: card.back.trim(),
    }));
  }

  private parseSingleFlashcardResponse(data: unknown): FlashcardDraft {
    const flashcards = this.parseFlashcardsResponse(data, 1);

    if (flashcards.length === 0) {
      throw new OpenRouterAPIError("No flashcard returned from regeneration response.", 500, data);
    }

    return flashcards[0];
  }

  private generateMockFlashcards(text: string, desiredCount: number): FlashcardDraft[] {
    const sentences = text
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
    const count = Math.min(desiredCount, sentences.length);

    const mockFlashcards: FlashcardDraft[] = [];

    for (let i = 0; i < count; i += 1) {
      const sentence = sentences[i];

      mockFlashcards.push({
        front: `What is the main point of: "${sentence.slice(0, 200)}"?`,
        back: sentence.slice(0, 500),
      });
    }

    return mockFlashcards;
  }
}

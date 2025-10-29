/**
 * Unit tests for FlashcardGenerationService
 * Tests AI service layer and validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FlashcardGenerationService,
  OpenRouterAPIError,
  generateFlashcardsSchema,
} from "./flashcard-generation.service";
import type { GenerateFlashcardsCommand } from "@/types";

describe("FlashcardGenerationService", () => {
  let service: FlashcardGenerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize with default configuration", () => {
      service = new FlashcardGenerationService();
      expect(service).toBeInstanceOf(FlashcardGenerationService);
    });

    it("should initialize with custom configuration", () => {
      service = new FlashcardGenerationService({
        apiKey: "test-api-key",
        model: "custom-model",
        temperature: 0.7,
        maxTokens: 2000,
      });
      expect(service).toBeInstanceOf(FlashcardGenerationService);
    });
  });

  describe("generateFlashcardsSchema Validation", () => {
    it("should accept valid command with text and desired_count", () => {
      const validCommand = {
        text: "This is a valid text for generating flashcards.",
        desired_count: 5,
      };

      const result = generateFlashcardsSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });

    it("should reject text exceeding 10,000 characters", () => {
      const invalidCommand = {
        text: "x".repeat(10001),
        desired_count: 5,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("10,000");
      }
    });

    it("should accept text with exactly 10,000 characters", () => {
      const validCommand = {
        text: "x".repeat(10000),
        desired_count: 5,
      };

      const result = generateFlashcardsSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });

    it("should reject negative desired_count", () => {
      const invalidCommand = {
        text: "Valid text",
        desired_count: -1,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
    });

    it("should reject zero desired_count", () => {
      const invalidCommand = {
        text: "Valid text",
        desired_count: 0,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
    });

    it("should reject desired_count exceeding 100", () => {
      const invalidCommand = {
        text: "Valid text",
        desired_count: 101,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100");
      }
    });

    it("should accept desired_count of exactly 100", () => {
      const validCommand = {
        text: "Valid text",
        desired_count: 100,
      };

      const result = generateFlashcardsSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });

    it("should reject non-integer desired_count", () => {
      const invalidCommand = {
        text: "Valid text",
        desired_count: 5.5,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
    });

    it("should reject missing text field", () => {
      const invalidCommand = {
        desired_count: 5,
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
    });

    it("should reject missing desired_count field", () => {
      const invalidCommand = {
        text: "Valid text",
      };

      const result = generateFlashcardsSchema.safeParse(invalidCommand);
      expect(result.success).toBe(false);
    });
  });

  describe("generateFlashcards - Mock Mode (No API Key)", () => {
    beforeEach(() => {
      service = new FlashcardGenerationService({ apiKey: "" });
    });

    it("should return mock flashcards when API key is not configured", async () => {
      const command: GenerateFlashcardsCommand = {
        text: "First sentence for flashcard one. Second sentence for flashcard two. Third sentence for flashcard three.",
        desired_count: 3,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty("front");
      expect(result[0]).toHaveProperty("back");
    });

    it("should return empty array when text is empty", async () => {
      const command: GenerateFlashcardsCommand = {
        text: "   ",
        desired_count: 5,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toEqual([]);
    });

    it("should generate requested number of mock flashcards", async () => {
      const command: GenerateFlashcardsCommand = {
        text: "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five. Sentence six. Sentence seven.",
        desired_count: 7,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(7);
    });
  });

  describe("generateFlashcards - API Mode (With API Key)", () => {
    beforeEach(() => {
      service = new FlashcardGenerationService({ apiKey: "test-api-key-123" });
    });

    it("should call OpenRouter API with correct parameters", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "AI Question 1", back: "AI Answer 1" },
                  { front: "AI Question 2", back: "AI Answer 2" },
                ],
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const command: GenerateFlashcardsCommand = {
        text: "Sample study material about biology",
        desired_count: 2,
      };

      const result = await service.generateFlashcards(command);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("openrouter.ai"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key-123",
            "Content-Type": "application/json",
          }),
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0].front).toBe("AI Question 1");
      expect(result[0].back).toBe("AI Answer 1");
    });

    it("should handle successful API response", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [{ front: "Generated Q", back: "Generated A" }],
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const command: GenerateFlashcardsCommand = {
        text: "Study material",
        desired_count: 1,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toEqual([{ front: "Generated Q", back: "Generated A" }]);
    });

    it("should throw OpenRouterAPIError on API failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ error: "API Error" }),
      });

      const command: GenerateFlashcardsCommand = {
        text: "Study material",
        desired_count: 3,
      };

      await expect(service.generateFlashcards(command)).rejects.toThrow(OpenRouterAPIError);
    });

    it("should throw OpenRouterAPIError on network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      const command: GenerateFlashcardsCommand = {
        text: "Study material",
        desired_count: 3,
      };

      await expect(service.generateFlashcards(command)).rejects.toThrow(OpenRouterAPIError);
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "This is not valid JSON",
              },
            },
          ],
        }),
      });

      const command: GenerateFlashcardsCommand = {
        text: "Study material",
        desired_count: 3,
      };

      await expect(service.generateFlashcards(command)).rejects.toThrow();
    });

    it("should validate flashcard structure from API response", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [
                  { front: "", back: "Answer" }, // Invalid: empty front
                ],
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const command: GenerateFlashcardsCommand = {
        text: "Study material",
        desired_count: 1,
      };

      await expect(service.generateFlashcards(command)).rejects.toThrow();
    });

    it("should trim whitespace from text before processing", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                flashcards: [{ front: "Q", back: "A" }],
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const command: GenerateFlashcardsCommand = {
        text: "   Trimmed text   ",
        desired_count: 1,
      };

      await service.generateFlashcards(command);

      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages[1].content).toContain("Trimmed text");
      expect(requestBody.messages[1].content).not.toMatch(/^\s+/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle desired_count boundary value of 1", async () => {
      service = new FlashcardGenerationService({ apiKey: "" });

      const command: GenerateFlashcardsCommand = {
        text: "Minimal text",
        desired_count: 1,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(1);
    });

    it("should handle desired_count boundary value of 50", async () => {
      service = new FlashcardGenerationService({ apiKey: "" });

      const sentences = Array.from({ length: 50 }, (_, i) => `Sentence number ${i + 1}`).join(". ") + ".";
      const command: GenerateFlashcardsCommand = {
        text: sentences,
        desired_count: 50,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(50);
    });

    it("should handle text with special characters", async () => {
      service = new FlashcardGenerationService({ apiKey: "" });

      const command: GenerateFlashcardsCommand = {
        text: "First sentence with special chars: <>&\"'. Second sentence with more special chars: <>!@#$%.",
        desired_count: 2,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(2);
    });

    it("should handle text with Unicode characters", async () => {
      service = new FlashcardGenerationService({ apiKey: "" });

      const command: GenerateFlashcardsCommand = {
        text: "First sentence with Unicode: 你好 世界. Second sentence with Arabic: مرحبا العالم.",
        desired_count: 2,
      };

      const result = await service.generateFlashcards(command);

      expect(result).toHaveLength(2);
    });
  });

  describe("OpenRouterAPIError", () => {
    it("should create error with message only", () => {
      const error = new OpenRouterAPIError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.name).toBe("OpenRouterAPIError");
      expect(error.status).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it("should create error with status and details", () => {
      const details = { code: "RATE_LIMIT" };
      const error = new OpenRouterAPIError("Rate limit exceeded", 429, details);

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.status).toBe(429);
      expect(error.details).toEqual(details);
    });

    it("should be instance of Error", () => {
      const error = new OpenRouterAPIError("Test");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenRouterAPIError);
    });
  });
});

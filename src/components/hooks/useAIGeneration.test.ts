/**
 * Unit tests for useAIGeneration hook
 * Tests AI flashcard generation workflow and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAIGeneration } from "./useAIGeneration";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from "@/types";

// Mock the sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock window.location
const originalLocation = window.location;

describe("useAIGeneration", () => {
  const mockProjectId = "test-project-456";
  let uuidCounter = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    uuidCounter = 0;
    vi.spyOn(global.crypto, "randomUUID").mockImplementation(() => {
      uuidCounter++;
      return `00000000-0000-0000-0000-${String(uuidCounter).padStart(12, "0")}` as `${string}-${string}-${string}-${string}-${string}`;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = { href: "" };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = originalLocation;
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      expect(result.current.viewMode).toBe("form");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.saveProgress).toBe(null);
      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it("should provide all expected functions", () => {
      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      expect(typeof result.current.generateFlashcards).toBe("function");
      expect(typeof result.current.updateDraft).toBe("function");
      expect(typeof result.current.deleteDraft).toBe("function");
      expect(typeof result.current.updateFeedback).toBe("function");
      expect(typeof result.current.saveAllDrafts).toBe("function");
      expect(typeof result.current.discardAllDrafts).toBe("function");
    });
  });

  describe("generateFlashcards", () => {
    it("should successfully generate flashcards and update state", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
          { front: "Question 3", back: "Answer 3" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      const command: GenerateFlashcardsCommand = {
        text: "Sample text for generation",
        desired_count: 3,
      };

      await act(async () => {
        await result.current.generateFlashcards(command);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.viewMode).toBe("review");
        expect(result.current.drafts).toHaveLength(3);
        expect(result.current.drafts[0].front).toBe("Question 1");
        expect(result.current.error).toBe(null);
      });
    });

    it("should set isLoading to true during generation", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ drafts: [] }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      const command: GenerateFlashcardsCommand = {
        text: "Test text",
        desired_count: 5,
      };

      act(() => {
        result.current.generateFlashcards(command);
      });

      // Check immediately that loading is true
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should call API with correct endpoint and payload", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ drafts: [] }),
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      const command: GenerateFlashcardsCommand = {
        text: "Test text for flashcards",
        desired_count: 7,
      };

      await act(async () => {
        await result.current.generateFlashcards(command);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/flashcards/ai-generate`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        })
      );
    });

    it("should handle API error responses", async () => {
      const errorMessage = "AI service unavailable";

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: errorMessage }),
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      const command: GenerateFlashcardsCommand = {
        text: "Test text",
        desired_count: 5,
      };

      await act(async () => {
        await result.current.generateFlashcards(command);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.viewMode).toBe("form");
        expect(result.current.drafts).toEqual([]);
      });
    });

    it("should handle network errors", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network failure"));

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      const command: GenerateFlashcardsCommand = {
        text: "Test text",
        desired_count: 5,
      };

      await act(async () => {
        await result.current.generateFlashcards(command);
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Network failure");
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should assign unique IDs to draft flashcards", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 2 });
      });

      await waitFor(() => {
        expect(result.current.drafts[0]).toHaveProperty("id");
        expect(result.current.drafts[1]).toHaveProperty("id");
        expect(result.current.drafts[0].id).not.toBe(result.current.drafts[1].id);
      });
    });
  });

  describe("updateDraft", () => {
    it("should update specific draft properties", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Original Q1", back: "Original A1" },
          { front: "Original Q2", back: "Original A2" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 2 });
      });

      await waitFor(() => {
        expect(result.current.drafts).toHaveLength(2);
      });

      const draftId = result.current.drafts[0].id;

      act(() => {
        result.current.updateDraft(draftId, { front: "Updated Question" });
      });

      await waitFor(() => {
        expect(result.current.drafts[0].front).toBe("Updated Question");
      });

      expect(result.current.drafts[0].back).toBe("Original A1");
      expect(result.current.drafts[1].front).toBe("Original Q2");
    });

    it("should not affect other drafts when updating one", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
          { front: "Q3", back: "A3" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 3 });
      });

      await waitFor(() => {
        expect(result.current.drafts).toHaveLength(3);
      });

      const middleDraftId = result.current.drafts[1].id;

      act(() => {
        result.current.updateDraft(middleDraftId, { back: "Modified Answer" });
      });

      await waitFor(() => {
        expect(result.current.drafts[1].back).toBe("Modified Answer");
      });

      expect(result.current.drafts[0].back).toBe("A1");
      expect(result.current.drafts[2].back).toBe("A3");
    });
  });

  describe("deleteDraft", () => {
    it("should remove draft from the list", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
          { front: "Q3", back: "A3" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 3 });
      });

      await waitFor(() => {
        expect(result.current.drafts).toHaveLength(3);
      });

      const draftToDeleteId = result.current.drafts[1].id;

      act(() => {
        result.current.deleteDraft(draftToDeleteId);
      });

      await waitFor(() => {
        expect(result.current.drafts).toHaveLength(2);
      });

      expect(result.current.drafts.find((d) => d.id === draftToDeleteId)).toBeUndefined();
    });
  });

  describe("updateFeedback", () => {
    it("should toggle feedback up for a draft", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [{ front: "Q1", back: "A1" }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 1 });
      });

      const draftId = result.current.drafts[0].id;

      // Set feedback to up
      act(() => {
        result.current.updateFeedback(draftId, "up");
      });

      expect(result.current.drafts[0].feedback).toBe("up");

      // Toggle off by clicking up again
      act(() => {
        result.current.updateFeedback(draftId, "up");
      });

      expect(result.current.drafts[0].feedback).toBeUndefined();
    });

    it("should switch feedback from up to down", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [{ front: "Q1", back: "A1" }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 1 });
      });

      const draftId = result.current.drafts[0].id;

      // Set to up
      act(() => {
        result.current.updateFeedback(draftId, "up");
      });

      expect(result.current.drafts[0].feedback).toBe("up");

      // Change to down
      act(() => {
        result.current.updateFeedback(draftId, "down");
      });

      expect(result.current.drafts[0].feedback).toBe("down");
    });
  });

  describe("saveAllDrafts", () => {
    it("should show error when there are no drafts to save", async () => {
      const { result } = renderHook(() => useAIGeneration(mockProjectId));
      const { toast } = await import("sonner");

      await act(async () => {
        await result.current.saveAllDrafts();
      });

      expect(toast.error).toHaveBeenCalledWith("No drafts to save");
    });

    it("should validate drafts before saving", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [{ front: "x".repeat(201), back: "Valid back" }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));
      const { toast } = await import("sonner");

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 1 });
      });

      await act(async () => {
        await result.current.saveAllDrafts();
      });

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Some drafts have invalid content"));
    });

    it("should save all valid drafts successfully", async () => {
      const mockGenerateResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGenerateResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "flashcard-1" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "flashcard-2" }),
        });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 2 });
      });

      await act(async () => {
        await result.current.saveAllDrafts();
      });

      await waitFor(() => {
        expect(window.location.href).toBe(`/projects/${mockProjectId}`);
      });
    });

    it("should track save progress correctly", async () => {
      const mockGenerateResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
          { front: "Q3", back: "A3" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGenerateResponse,
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ id: "flashcard-x" }),
        });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 3 });
      });

      act(() => {
        result.current.saveAllDrafts();
      });

      // Initially, progress should be set
      await waitFor(() => {
        expect(result.current.isSaving).toBe(true);
      });

      // After completion, progress should be cleared
      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
        expect(result.current.saveProgress).toBe(null);
      });
    });

    it("should handle partial save failures", async () => {
      const mockGenerateResponse: GenerateFlashcardsResponseDto = {
        drafts: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGenerateResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "flashcard-1" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: "Save failed" }),
        });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));
      const { toast } = await import("sonner");

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 2 });
      });

      await act(async () => {
        await result.current.saveAllDrafts();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("1 of 2"));
      });
    });
  });

  describe("discardAllDrafts", () => {
    it("should clear drafts and return to form view", async () => {
      const mockResponse: GenerateFlashcardsResponseDto = {
        drafts: [{ front: "Q1", back: "A1" }],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useAIGeneration(mockProjectId));

      await act(async () => {
        await result.current.generateFlashcards({ text: "Test", desired_count: 1 });
      });

      expect(result.current.viewMode).toBe("review");
      expect(result.current.drafts).toHaveLength(1);

      act(() => {
        result.current.discardAllDrafts();
      });

      expect(result.current.viewMode).toBe("form");
      expect(result.current.drafts).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });
});

/**
 * Custom hook for managing AI flashcard generation workflow
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDto,
  FlashcardDraft,
  CreateFlashcardCommand,
} from "@/types";
import type { FlashcardDraftViewModel } from "@/components/flashcard/ai-generation/types";

interface UseAIGenerationReturn {
  viewMode: "form" | "review";
  isLoading: boolean;
  isSaving: boolean;
  saveProgress: { current: number; total: number } | null;
  drafts: FlashcardDraftViewModel[];
  error: string | null;
  generateFlashcards: (command: GenerateFlashcardsCommand) => Promise<void>;
  updateDraft: (id: string, updates: Partial<FlashcardDraft>) => void;
  deleteDraft: (id: string) => void;
  updateFeedback: (id: string, feedback: "up" | "down") => void;
  saveAllDrafts: () => Promise<void>;
  discardAllDrafts: () => void;
}

export function useAIGeneration(projectId: string): UseAIGenerationReturn {
  const [viewMode, setViewMode] = useState<"form" | "review">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null);
  const [drafts, setDrafts] = useState<FlashcardDraftViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates flashcards using the AI API
   */
  const generateFlashcards = useCallback(
    async (command: GenerateFlashcardsCommand) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/ai-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to generate flashcards");
        }

        const data: GenerateFlashcardsResponseDto = await response.json();

        // Map FlashcardDraft[] to FlashcardDraftViewModel[] with client-side IDs
        const viewModels: FlashcardDraftViewModel[] = data.drafts.map((draft) => ({
          ...draft,
          id: crypto.randomUUID(),
        }));

        setDrafts(viewModels);
        setViewMode("review");
        toast.success(`Successfully generated ${viewModels.length} flashcard${viewModels.length !== 1 ? "s" : ""}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Network error occurred";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [projectId]
  );

  /**
   * Updates a specific draft in the drafts array
   */
  const updateDraft = useCallback((id: string, updates: Partial<FlashcardDraft>) => {
    setDrafts((prevDrafts) => prevDrafts.map((draft) => (draft.id === id ? { ...draft, ...updates } : draft)));
  }, []);

  /**
   * Removes a draft from the drafts array
   */
  const deleteDraft = useCallback((id: string) => {
    setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.id !== id));
    toast.success("Draft deleted");
  }, []);

  /**
   * Updates the feedback state for a specific draft
   */
  const updateFeedback = useCallback((id: string, feedback: "up" | "down") => {
    setDrafts((prevDrafts) =>
      prevDrafts.map((draft) =>
        draft.id === id ? { ...draft, feedback: draft.feedback === feedback ? undefined : feedback } : draft
      )
    );
  }, []);

  /**
   * Saves all drafts as new flashcards using batch API calls
   */
  const saveAllDrafts = useCallback(async () => {
    if (drafts.length === 0) {
      toast.error("No drafts to save");
      return;
    }

    // Validate all drafts before saving
    const invalidDrafts = drafts.filter((draft) => draft.front.length > 200 || draft.back.length > 500);

    if (invalidDrafts.length > 0) {
      toast.error("Some drafts have invalid content. Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    setIsLoading(true);
    setSaveProgress({ current: 0, total: drafts.length });
    setError(null);

    try {
      let completed = 0;

      // Create API calls for all drafts with progress tracking
      const savePromises = drafts.map(async (draft) => {
        const command: CreateFlashcardCommand = {
          front: draft.front,
          back: draft.back,
        };

        const response = await fetch(`/api/projects/${projectId}/flashcards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          throw new Error(`Failed to save flashcard: ${draft.front.substring(0, 30)}...`);
        }

        // Update progress
        completed++;
        setSaveProgress({ current: completed, total: drafts.length });

        return { success: true, draft };
      });

      // Wait for all saves to complete
      const results = await Promise.allSettled(savePromises);

      // Count successes and failures
      const successes = results.filter((r) => r.status === "fulfilled");
      const failures = results.filter((r) => r.status === "rejected");

      if (failures.length === 0) {
        toast.success(`Successfully saved ${successes.length} flashcard${successes.length !== 1 ? "s" : ""}`);
        // Redirect to project detail page
        window.location.href = `/projects/${projectId}`;
      } else {
        toast.error(`Saved ${successes.length} of ${drafts.length} flashcards. ${failures.length} failed.`);

        // Remove successfully saved drafts
        const failedDraftIds = failures.map((f) => f.reason?.draft?.id).filter(Boolean);
        setDrafts((prevDrafts) => prevDrafts.filter((draft) => failedDraftIds.includes(draft.id)));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save flashcards";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
      setSaveProgress(null);
    }
  }, [drafts, projectId]);

  /**
   * Resets the state to return to the form view
   */
  const discardAllDrafts = useCallback(() => {
    setDrafts([]);
    setViewMode("form");
    setError(null);
    toast.info("All drafts discarded");
  }, []);

  return {
    viewMode,
    isLoading,
    isSaving,
    saveProgress,
    drafts,
    error,
    generateFlashcards,
    updateDraft,
    deleteDraft,
    updateFeedback,
    saveAllDrafts,
    discardAllDrafts,
  };
}

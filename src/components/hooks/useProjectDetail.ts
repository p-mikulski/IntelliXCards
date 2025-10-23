import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  ProjectDto,
  FlashcardListDto,
  FlashcardListItemDto,
  FlashcardDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
} from "@/types";

/**
 * ViewModel for the Project Detail View
 * Encapsulates all state required for managing a project and its flashcards
 */
export interface ProjectDetailViewModel {
  project: ProjectDto | null;
  flashcards: FlashcardListItemDto[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  dialogs: {
    create: { isOpen: boolean };
    edit: { isOpen: boolean; flashcardId: string | null };
    delete: { isOpen: boolean; flashcardId: string | null };
  };
}

/**
 * Custom hook for managing the Project Detail view state and logic
 * Handles fetching project data, flashcards, and CRUD operations for flashcards
 */
export const useProjectDetail = (projectId: string) => {
  const [viewModel, setViewModel] = useState<ProjectDetailViewModel>({
    project: null,
    flashcards: [],
    isLoading: true,
    error: null,
    isSubmitting: false,
    dialogs: {
      create: { isOpen: false },
      edit: { isOpen: false, flashcardId: null },
      delete: { isOpen: false, flashcardId: null },
    },
  });

  /**
   * Fetches the project details from the API
   */
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error("Failed to fetch project details");
      }
      const project: ProjectDto = await response.json();
      setViewModel((prev) => ({ ...prev, project, error: null }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setViewModel((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [projectId]);

  /**
   * Fetches the list of flashcards for the project
   */
  const fetchFlashcards = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/flashcards`);
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      const data: FlashcardListDto = await response.json();
      setViewModel((prev) => ({ ...prev, flashcards: data.flashcards, error: null }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setViewModel((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [projectId]);

  /**
   * Loads initial data (project and flashcards) on mount
   */
  useEffect(() => {
    const loadInitialData = async () => {
      setViewModel((prev) => ({ ...prev, isLoading: true }));
      await Promise.all([fetchProject(), fetchFlashcards()]);
      setViewModel((prev) => ({ ...prev, isLoading: false }));
    };

    loadInitialData();
  }, [fetchProject, fetchFlashcards]);

  /**
   * Creates a new flashcard
   */
  const handleCreateFlashcard = useCallback(
    async (data: CreateFlashcardCommand) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create flashcard");
        }

        const newFlashcard: FlashcardDto = await response.json();

        // Update the flashcard list with the new item
        setViewModel((prev) => ({
          ...prev,
          flashcards: [
            {
              id: newFlashcard.id,
              front: newFlashcard.front,
              back: newFlashcard.back,
              next_review_date: newFlashcard.next_review_date,
              ease_factor: newFlashcard.ease_factor,
              feedback: newFlashcard.feedback,
              feedback_timestamp: newFlashcard.feedback_timestamp,
            },
            ...prev.flashcards,
          ],
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            create: { isOpen: false },
          },
        }));

        toast.success("Flashcard created successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to create flashcard", {
          description: errorMessage,
        });
        setViewModel((prev) => ({
          ...prev,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId]
  );

  /**
   * Updates an existing flashcard
   */
  const handleUpdateFlashcard = useCallback(
    async (flashcardId: string, data: UpdateFlashcardCommand) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      // Store original flashcards for rollback on error
      const originalFlashcards = viewModel.flashcards;

      // Optimistically update the UI
      setViewModel((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) =>
          f.id === flashcardId ? { ...f, front: data.front ?? f.front, back: data.back ?? f.back } : f
        ),
      }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }

        const updatedFlashcard: FlashcardDto = await response.json();

        // Update with server response
        setViewModel((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === flashcardId
              ? {
                  id: updatedFlashcard.id,
                  front: updatedFlashcard.front,
                  back: updatedFlashcard.back,
                  next_review_date: updatedFlashcard.next_review_date,
                  ease_factor: updatedFlashcard.ease_factor,
                  feedback: updatedFlashcard.feedback,
                  feedback_timestamp: updatedFlashcard.feedback_timestamp,
                }
              : f
          ),
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            edit: { isOpen: false, flashcardId: null },
          },
        }));

        toast.success("Flashcard updated successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to update flashcard", {
          description: errorMessage,
        });
        // Rollback on error
        setViewModel((prev) => ({
          ...prev,
          flashcards: originalFlashcards,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId, viewModel.flashcards]
  );

  /**
   * Deletes a flashcard
   */
  const handleDeleteFlashcard = useCallback(
    async (flashcardId: string) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      // Store original flashcards for rollback on error
      const originalFlashcards = viewModel.flashcards;

      // Optimistically remove from UI
      setViewModel((prev) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => f.id !== flashcardId),
      }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }

        // Success - close the delete dialog
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            delete: { isOpen: false, flashcardId: null },
          },
        }));

        toast.success("Flashcard deleted successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to delete flashcard", {
          description: errorMessage,
        });
        // Rollback on error
        setViewModel((prev) => ({
          ...prev,
          flashcards: originalFlashcards,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId, viewModel.flashcards]
  );

  /**
   * Dialog management functions
   */
  const openCreateDialog = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, create: { isOpen: true } },
    }));
  }, []);

  const openEditDialog = useCallback((flashcardId: string) => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, edit: { isOpen: true, flashcardId } },
    }));
  }, []);

  const openDeleteDialog = useCallback((flashcardId: string) => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, delete: { isOpen: true, flashcardId } },
    }));
  }, []);

  const closeDialogs = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: {
        create: { isOpen: false },
        edit: { isOpen: false, flashcardId: null },
        delete: { isOpen: false, flashcardId: null },
      },
    }));
  }, []);

  return {
    viewModel,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
  };
};

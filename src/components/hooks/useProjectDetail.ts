import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  ProjectDto,
  FlashcardListDto,
  FlashcardListItemDto,
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
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  isLoading: boolean;
  isLoadingFlashcards: boolean;
  error: string | null;
  isSubmitting: boolean;
  dialogs: {
    create: { isOpen: boolean };
    edit: { isOpen: boolean; flashcardId: string | null };
    delete: { isOpen: boolean; flashcardId: string | null };
    batchDelete: { isOpen: boolean };
    move: { isOpen: boolean; flashcardId: string | null };
    bulkMove: { isOpen: boolean };
  };
  selection: {
    isSelectMode: boolean;
    selectedIds: Set<string>;
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
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 9,
    },
    isLoading: true,
    isLoadingFlashcards: true,
    error: null,
    isSubmitting: false,
    dialogs: {
      create: { isOpen: false },
      edit: { isOpen: false, flashcardId: null },
      delete: { isOpen: false, flashcardId: null },
      batchDelete: { isOpen: false },
      move: { isOpen: false, flashcardId: null },
      bulkMove: { isOpen: false },
    },
    selection: {
      isSelectMode: false,
      selectedIds: new Set(),
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
      setViewModel((prev) => ({ ...prev, project, error: null, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setViewModel((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [projectId]);

  /**
   * Fetches the list of flashcards for the project with pagination
   */
  const fetchFlashcards = useCallback(
    async (page = 1, limit = 9) => {
      try {
        setViewModel((prev) => ({ ...prev, isLoadingFlashcards: true }));

        const response = await fetch(`/api/projects/${projectId}/flashcards?page=${page}&limit=${limit}`);
        if (!response.ok) {
          throw new Error("Failed to fetch flashcards");
        }
        const data: FlashcardListDto = await response.json();

        const totalPages = Math.ceil(data.total / data.limit);

        setViewModel((prev) => ({
          ...prev,
          flashcards: data.flashcards,
          pagination: {
            currentPage: data.page,
            totalPages,
            totalCount: data.total,
            pageSize: data.limit,
          },
          error: null,
          isLoadingFlashcards: false,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setViewModel((prev) => ({ ...prev, error: errorMessage, isLoadingFlashcards: false }));
      }
    },
    [projectId]
  );

  /**
   * Loads initial data (project and flashcards) on mount
   */
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchProject(), fetchFlashcards()]);
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

        // Close dialog and refresh the current page
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            create: { isOpen: false },
          },
        }));

        // Refetch flashcards to reflect the new item
        await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

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
    [projectId, fetchFlashcards, viewModel.pagination.currentPage, viewModel.pagination.pageSize]
  );

  /**
   * Updates an existing flashcard
   */
  const handleUpdateFlashcard = useCallback(
    async (flashcardId: string, data: UpdateFlashcardCommand) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }

        // Close dialog
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            edit: { isOpen: false, flashcardId: null },
          },
        }));

        // Refetch flashcards to reflect the update
        await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

        toast.success("Flashcard updated successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to update flashcard", {
          description: errorMessage,
        });
        setViewModel((prev) => ({
          ...prev,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId, fetchFlashcards, viewModel.pagination.currentPage, viewModel.pagination.pageSize]
  );

  /**
   * Moves a flashcard to a different project
   */
  const handleMoveFlashcard = useCallback(
    async (flashcardId: string, targetProjectId: string) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: targetProjectId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to move flashcard");
        }

        // Close dialog
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            move: { isOpen: false, flashcardId: null },
          },
        }));

        // Refetch flashcards to reflect the removal
        await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

        toast.success("Flashcard moved successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to move flashcard", {
          description: errorMessage,
        });
        setViewModel((prev) => ({
          ...prev,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId, fetchFlashcards, viewModel.pagination.currentPage, viewModel.pagination.pageSize]
  );

  /**
   * Moves multiple flashcards to a different project
   */
  const handleBulkMoveFlashcards = useCallback(
    async (targetProjectId: string) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      const flashcardIds = Array.from(viewModel.selection.selectedIds);

      try {
        // Move each flashcard individually
        const movePromises = flashcardIds.map((flashcardId) =>
          fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ project_id: targetProjectId }),
          })
        );

        const responses = await Promise.all(movePromises);

        // Check if all requests were successful
        const failedRequests = responses.filter((response) => !response.ok);
        if (failedRequests.length > 0) {
          throw new Error(`Failed to move ${failedRequests.length} flashcard(s)`);
        }

        // Close dialog and clear selection
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            bulkMove: { isOpen: false },
          },
          selection: {
            isSelectMode: false,
            selectedIds: new Set(),
          },
        }));

        // Refetch flashcards to reflect the changes
        await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

        toast.success(`Successfully moved ${flashcardIds.length} flashcard(s)!`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to move flashcards", {
          description: errorMessage,
        });
        setViewModel((prev) => ({
          ...prev,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [
      projectId,
      fetchFlashcards,
      viewModel.selection.selectedIds,
      viewModel.pagination.currentPage,
      viewModel.pagination.pageSize,
    ]
  );

  /**
   * Deletes a flashcard
   */
  const handleDeleteFlashcard = useCallback(
    async (flashcardId: string) => {
      setViewModel((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }

        // Close the delete dialog
        setViewModel((prev) => ({
          ...prev,
          isSubmitting: false,
          dialogs: {
            ...prev.dialogs,
            delete: { isOpen: false, flashcardId: null },
          },
        }));

        // Refetch flashcards to reflect the deletion
        await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

        toast.success("Flashcard deleted successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast.error("Failed to delete flashcard", {
          description: errorMessage,
        });
        setViewModel((prev) => ({
          ...prev,
          error: errorMessage,
          isSubmitting: false,
        }));
      }
    },
    [projectId, fetchFlashcards, viewModel.pagination.currentPage, viewModel.pagination.pageSize]
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

  const openMoveDialog = useCallback((flashcardId: string) => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, move: { isOpen: true, flashcardId } },
    }));
  }, []);

  const openBulkMoveDialog = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, bulkMove: { isOpen: true } },
    }));
  }, []);

  const closeDialogs = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: {
        create: { isOpen: false },
        edit: { isOpen: false, flashcardId: null },
        delete: { isOpen: false, flashcardId: null },
        batchDelete: { isOpen: false },
        move: { isOpen: false, flashcardId: null },
        bulkMove: { isOpen: false },
      },
    }));
  }, []);

  /**
   * Selection management functions
   */
  const toggleSelectMode = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      selection: {
        isSelectMode: !prev.selection.isSelectMode,
        selectedIds: new Set(), // Clear selection when toggling mode
      },
    }));
  }, []);

  const toggleSelectFlashcard = useCallback((flashcardId: string) => {
    setViewModel((prev) => {
      const newSelectedIds = new Set(prev.selection.selectedIds);
      if (newSelectedIds.has(flashcardId)) {
        newSelectedIds.delete(flashcardId);
      } else {
        newSelectedIds.add(flashcardId);
      }
      return {
        ...prev,
        selection: {
          ...prev.selection,
          selectedIds: newSelectedIds,
        },
      };
    });
  }, []);

  const selectAllFlashcards = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      selection: {
        ...prev.selection,
        selectedIds: new Set(prev.flashcards.map((f) => f.id)),
      },
    }));
  }, []);

  const unselectAllFlashcards = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      selection: {
        ...prev.selection,
        selectedIds: new Set(),
      },
    }));
  }, []);

  const openBatchDeleteDialog = useCallback(() => {
    setViewModel((prev) => ({
      ...prev,
      dialogs: { ...prev.dialogs, batchDelete: { isOpen: true } },
    }));
  }, []);

  /**
   * Deletes multiple flashcards
   */
  const handleBatchDeleteFlashcards = useCallback(async () => {
    const flashcardIds = Array.from(viewModel.selection.selectedIds);
    if (flashcardIds.length === 0) return;

    setViewModel((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Delete all flashcards in parallel
      const deletePromises = flashcardIds.map((flashcardId) =>
        fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter((r) => !r.ok);

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} flashcard(s)`);
      }

      // Success - close dialog and clear selection
      setViewModel((prev) => ({
        ...prev,
        isSubmitting: false,
        selection: {
          isSelectMode: false,
          selectedIds: new Set(),
        },
        dialogs: {
          ...prev.dialogs,
          batchDelete: { isOpen: false },
        },
      }));

      // Refetch flashcards to reflect deletions
      await fetchFlashcards(viewModel.pagination.currentPage, viewModel.pagination.pageSize);

      toast.success(`Successfully deleted ${flashcardIds.length} flashcard(s)!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error("Failed to delete flashcards", {
        description: errorMessage,
      });
      setViewModel((prev) => ({
        ...prev,
        error: errorMessage,
        isSubmitting: false,
      }));
    }
  }, [
    projectId,
    fetchFlashcards,
    viewModel.selection.selectedIds,
    viewModel.pagination.currentPage,
    viewModel.pagination.pageSize,
  ]);

  /**
   * Handles page change for pagination
   */
  const handlePageChange = useCallback(
    (page: number) => {
      fetchFlashcards(page, viewModel.pagination.pageSize);
      // Clear selection when changing pages
      setViewModel((prev) => ({
        ...prev,
        selection: {
          isSelectMode: false,
          selectedIds: new Set(),
        },
      }));
    },
    [fetchFlashcards, viewModel.pagination.pageSize]
  );

  return {
    viewModel,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleMoveFlashcard,
    handleBulkMoveFlashcards,
    handleBatchDeleteFlashcards,
    handlePageChange,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    openMoveDialog,
    openBulkMoveDialog,
    openBatchDeleteDialog,
    closeDialogs,
    toggleSelectMode,
    toggleSelectFlashcard,
    selectAllFlashcards,
    unselectAllFlashcards,
  };
};

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProjectDashboard } from "./useProjectDashboard";
import type { ProjectListDto, CreateProjectCommand, UpdateProjectCommand, ProjectDto } from "@/types";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("useProjectDashboard", () => {
  const mockProjectDto: ProjectDto = {
    id: "project-1",
    title: "Test Project",
    description: "Test Description",
    tag: "work",
    user_id: "user-123",
    created_at: "2024-01-01T00:00:00Z",
    last_modified: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("fetchProjects", () => {
    it("should fetch projects successfully on mount", async () => {
      // Arrange
      const mockResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const { result } = renderHook(() => useProjectDashboard());

      // Assert - Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Test Project");
      expect(result.current.projects[0].formattedCreatedAt).toBeDefined();
      expect(result.current.pagination.totalCount).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it("should handle empty project list", async () => {
      // Arrange
      const mockResponse: ProjectListDto = {
        projects: [],
        page: 1,
        limit: 9,
        total: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const { result } = renderHook(() => useProjectDashboard());

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.projects).toEqual([]);
      expect(result.current.pagination.totalCount).toBe(0);
    });

    it("should handle fetch error", async () => {
      // Arrange
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      // Act
      const { result } = renderHook(() => useProjectDashboard());

      // Wait for error state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("Failed to fetch projects");
      expect(result.current.projects).toEqual([]);
    });

    it("should handle network error", async () => {
      // Arrange
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useProjectDashboard());

      // Wait for error state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("Network error");
    });
  });

  describe("handleCreateProject", () => {
    it("should create a project successfully with optimistic updates", async () => {
      // Arrange - Initial fetch
      const mockListResponse: ProjectListDto = {
        projects: [],
        page: 1,
        limit: 9,
        total: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock create response
      const newProject: ProjectDto = {
        id: "project-new",
        title: "New Project",
        description: "New Description",
        tag: "personal",
        user_id: "user-123",
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => newProject,
      });

      const command: CreateProjectCommand = {
        title: "New Project",
        description: "New Description",
        tag: "personal",
      };

      // Act
      await act(async () => {
        await result.current.handleCreateProject(command);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
      });

      expect(result.current.projects[0].id).toBe("project-new");
      expect(result.current.projects[0].title).toBe("New Project");
      expect(result.current.projects[0].optimisticState).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith('Project "New Project" created successfully!');
    });

    it("should show optimistic UI state during creation", async () => {
      // Arrange - Initial fetch
      const mockListResponse: ProjectListDto = {
        projects: [],
        page: 1,
        limit: 9,
        total: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock delayed create response
      let resolveCreate: ((value: Response) => void) | undefined;
      const createPromise = new Promise<Response>((resolve) => {
        resolveCreate = resolve;
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(createPromise as Promise<Response>);

      const command: CreateProjectCommand = {
        title: "Optimistic Project",
      };

      // Act - Start creation (don't await yet)
      act(() => {
        result.current.handleCreateProject(command);
      });

      // Assert - Check optimistic state
      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
      });

      expect(result.current.projects[0].title).toBe("Optimistic Project");
      expect(result.current.projects[0].optimisticState).toBe("syncing");
      expect(result.current.projects[0].id).toMatch(/^temp-/);

      // Complete the request
      if (resolveCreate) {
        resolveCreate({
          ok: true,
          json: async () => ({
            id: "project-real",
            title: "Optimistic Project",
            description: "",
            tag: "",
            user_id: "user-123",
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
          }),
        } as Response);
      }

      // Wait for optimistic state to resolve
      await waitFor(() => {
        expect(result.current.projects[0].optimisticState).toBeUndefined();
      });

      expect(result.current.projects[0].id).toBe("project-real");
    });

    it("should rollback on creation failure", async () => {
      // Arrange - Initial fetch
      const mockListResponse: ProjectListDto = {
        projects: [],
        page: 1,
        limit: 9,
        total: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed create
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const command: CreateProjectCommand = {
        title: "Failed Project",
      };

      // Act
      await act(async () => {
        await result.current.handleCreateProject(command);
      });

      // Assert - Project should be removed (rolled back)
      expect(result.current.projects).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith('Failed to create project "Failed Project"', expect.any(Object));
    });
  });

  describe("handleUpdateProject", () => {
    it("should update a project successfully with optimistic updates", async () => {
      // Arrange - Initial fetch with existing project
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock update response
      const updatedProject: ProjectDto = {
        ...mockProjectDto,
        title: "Updated Title",
        description: "Updated Description",
        last_modified: new Date().toISOString(),
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedProject,
      });

      const command: UpdateProjectCommand = {
        title: "Updated Title",
        description: "Updated Description",
      };

      // Act
      await act(async () => {
        await result.current.handleUpdateProject("project-1", command);
      });

      // Assert
      expect(result.current.projects[0].title).toBe("Updated Title");
      expect(result.current.projects[0].description).toBe("Updated Description");
      expect(result.current.projects[0].optimisticState).toBeUndefined();
      expect(toast.success).toHaveBeenCalledWith('Project "Updated Title" updated successfully!');
    });

    it("should rollback on update failure", async () => {
      // Arrange - Initial fetch with existing project
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed update
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const command: UpdateProjectCommand = {
        title: "Failed Update",
      };

      // Act
      await act(async () => {
        await result.current.handleUpdateProject("project-1", command);
      });

      // Assert - Should rollback to original state
      expect(result.current.projects[0].title).toBe("Test Project");
      expect(result.current.projects[0].description).toBe("Test Description");
      expect(toast.error).toHaveBeenCalledWith('Failed to update project "Failed Update"', expect.any(Object));
    });
  });

  describe("handleDeleteProject", () => {
    it("should delete a project successfully with optimistic updates", async () => {
      // Arrange - Initial fetch with existing project
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock delete response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Act
      await act(async () => {
        await result.current.handleDeleteProject("project-1");
      });

      // Assert
      expect(result.current.projects).toHaveLength(0);
      expect(toast.success).toHaveBeenCalledWith('Project "Test Project" deleted successfully!');
    });

    it("should show deleting state during deletion", async () => {
      // Arrange - Initial fetch with existing project
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock delayed delete response
      let resolveDelete: ((value: Response) => void) | undefined;
      const deletePromise = new Promise<Response>((resolve) => {
        resolveDelete = resolve;
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(deletePromise as Promise<Response>);

      // Act - Start deletion (don't await yet)
      act(() => {
        result.current.handleDeleteProject("project-1");
      });

      // Assert - Check deleting state
      await waitFor(() => {
        expect(result.current.projects[0].optimisticState).toBe("deleting");
      });

      // Complete the request
      if (resolveDelete) {
        resolveDelete({
          ok: true,
          json: async () => ({}),
        } as Response);
      }

      // Wait for deletion to complete
      await waitFor(() => {
        expect(result.current.projects).toHaveLength(0);
      });
    });

    it("should rollback on deletion failure", async () => {
      // Arrange - Initial fetch with existing project
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed delete
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      // Act
      await act(async () => {
        await result.current.handleDeleteProject("project-1");
      });

      // Assert - Project should still be there (rolled back)
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Test Project");
      expect(toast.error).toHaveBeenCalledWith('Failed to delete project "Test Project"', expect.any(Object));
    });
  });

  describe("dialog state management", () => {
    it("should open and close create dialog", async () => {
      // Arrange
      const mockListResponse: ProjectListDto = {
        projects: [],
        page: 1,
        limit: 9,
        total: 0,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Open create dialog
      act(() => {
        result.current.openCreateDialog();
      });

      // Assert
      expect(result.current.dialogState.create).toBe(true);

      // Act - Close dialog
      act(() => {
        result.current.closeDialogs();
      });

      // Assert
      expect(result.current.dialogState.create).toBe(false);
    });

    it("should open and close edit dialog with project data", async () => {
      // Arrange
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Open edit dialog
      act(() => {
        result.current.openEditDialog(result.current.projects[0]);
      });

      // Assert
      expect(result.current.dialogState.edit).toBeDefined();
      expect(result.current.dialogState.edit?.id).toBe("project-1");

      // Act - Close dialog
      act(() => {
        result.current.closeDialogs();
      });

      // Assert
      expect(result.current.dialogState.edit).toBeNull();
    });

    it("should open and close delete dialog with project data", async () => {
      // Arrange
      const mockListResponse: ProjectListDto = {
        projects: [mockProjectDto],
        page: 1,
        limit: 9,
        total: 1,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListResponse,
      });

      const { result } = renderHook(() => useProjectDashboard());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - Open delete dialog
      act(() => {
        result.current.openDeleteDialog(result.current.projects[0]);
      });

      // Assert
      expect(result.current.dialogState.delete).toBeDefined();
      expect(result.current.dialogState.delete?.id).toBe("project-1");

      // Act - Close dialog
      act(() => {
        result.current.closeDialogs();
      });

      // Assert
      expect(result.current.dialogState.delete).toBeNull();
    });
  });
});

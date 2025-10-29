import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectService } from "./project.service";
import type { CreateProjectCommand, UpdateProjectCommand, ProjectDto } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";

// Mock Supabase client
const createMockSupabaseClient = () => {
  return {
    from: vi.fn(() => mockQueryBuilder),
  } as unknown as SupabaseClient;
};

const mockQueryBuilder = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

describe("ProjectService", () => {
  let service: ProjectService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockUserId = "user-123";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    service = new ProjectService(mockSupabase);
  });

  describe("createProject", () => {
    it("should create a new project successfully", async () => {
      // Arrange
      const command: CreateProjectCommand = {
        title: "My Project",
        description: "Project description",
        tag: "work",
      };

      const expectedProject: ProjectDto = {
        id: "project-1",
        title: "My Project",
        description: "Project description",
        tag: "work",
        user_id: mockUserId,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: expectedProject,
        error: null,
      });

      // Act
      const result = await service.createProject(command, mockUserId);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        ...command,
        user_id: mockUserId,
      });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.single).toHaveBeenCalled();
    });

    it("should create a project with minimal data (title only)", async () => {
      // Arrange
      const command: CreateProjectCommand = {
        title: "Minimal Project",
      };

      const expectedProject: ProjectDto = {
        id: "project-2",
        title: "Minimal Project",
        description: "",
        tag: "",
        user_id: mockUserId,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: expectedProject,
        error: null,
      });

      // Act
      const result = await service.createProject(command, mockUserId);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(result.title).toBe("Minimal Project");
    });

    it("should throw an error when title is empty", async () => {
      // Arrange
      const command: CreateProjectCommand = {
        title: "",
      };

      // Act & Assert
      await expect(service.createProject(command, mockUserId)).rejects.toThrow();
    });

    it("should throw an error when title exceeds max length", async () => {
      // Arrange
      const command: CreateProjectCommand = {
        title: "a".repeat(101), // 101 characters
      };

      // Act & Assert
      await expect(service.createProject(command, mockUserId)).rejects.toThrow();
    });

    it("should throw an error when database insert fails", async () => {
      // Arrange
      const command: CreateProjectCommand = {
        title: "My Project",
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Database connection failed", code: "DB_ERROR" },
      });

      // Act & Assert
      await expect(service.createProject(command, mockUserId)).rejects.toThrow(
        "Failed to create project: Database connection failed"
      );
    });
  });

  describe("listProjects", () => {
    it("should list all projects for a user", async () => {
      // Arrange
      const mockProjects: ProjectDto[] = [
        {
          id: "project-1",
          title: "Project 1",
          description: "Description 1",
          tag: "work",
          user_id: mockUserId,
          created_at: "2024-01-01T00:00:00Z",
          last_modified: "2024-01-01T00:00:00Z",
        },
        {
          id: "project-2",
          title: "Project 2",
          description: "Description 2",
          tag: "personal",
          user_id: mockUserId,
          created_at: "2024-01-02T00:00:00Z",
          last_modified: "2024-01-02T00:00:00Z",
        },
      ];

      mockQueryBuilder.order.mockResolvedValueOnce({
        data: mockProjects,
        error: null,
      });

      // Act
      const result = await service.listProjects(mockUserId);

      // Assert
      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockQueryBuilder.select).toHaveBeenCalledWith("*");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith("created_at", { ascending: false });
    });

    it("should return an empty array when user has no projects", async () => {
      // Arrange
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Act
      const result = await service.listProjects(mockUserId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should throw an error when database query fails", async () => {
      // Arrange
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: null,
        error: { message: "Query timeout", code: "TIMEOUT" },
      });

      // Act & Assert
      await expect(service.listProjects(mockUserId)).rejects.toThrow("Failed to list projects: Query timeout");
    });
  });

  describe("getProjectById", () => {
    it("should retrieve a project by ID", async () => {
      // Arrange
      const projectId = "project-1";
      const mockProject: ProjectDto = {
        id: projectId,
        title: "My Project",
        description: "Description",
        tag: "work",
        user_id: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        last_modified: "2024-01-01T00:00:00Z",
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockProject,
        error: null,
      });

      // Act
      const result = await service.getProjectById(projectId, mockUserId);

      // Assert
      expect(result).toEqual(mockProject);
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", projectId);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("should throw 'Project not found' error when project does not exist", async () => {
      // Arrange
      const projectId = "non-existent-id";

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      // Act & Assert
      await expect(service.getProjectById(projectId, mockUserId)).rejects.toThrow("Project not found");
    });

    it("should throw 'Project not found' when project belongs to different user", async () => {
      // Arrange
      const projectId = "project-1";
      const differentUserId = "user-456";

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      // Act & Assert
      await expect(service.getProjectById(projectId, differentUserId)).rejects.toThrow("Project not found");
    });

    it("should throw an error when database query fails", async () => {
      // Arrange
      const projectId = "project-1";

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Connection lost", code: "CONN_ERROR" },
      });

      // Act & Assert
      await expect(service.getProjectById(projectId, mockUserId)).rejects.toThrow(
        "Failed to get project: Connection lost"
      );
    });
  });

  describe("updateProject", () => {
    it("should update a project successfully", async () => {
      // Arrange
      const projectId = "project-1";
      const command: UpdateProjectCommand = {
        title: "Updated Title",
        description: "Updated Description",
      };

      const updatedProject: ProjectDto = {
        id: projectId,
        title: "Updated Title",
        description: "Updated Description",
        tag: "work",
        user_id: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        last_modified: new Date().toISOString(),
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedProject,
        error: null,
      });

      // Act
      const result = await service.updateProject(projectId, mockUserId, command);

      // Assert
      expect(result).toEqual(updatedProject);
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(command);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("id", projectId);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("should update only the title when description is not provided", async () => {
      // Arrange
      const projectId = "project-1";
      const command: UpdateProjectCommand = {
        title: "New Title Only",
      };

      const updatedProject: ProjectDto = {
        id: projectId,
        title: "New Title Only",
        description: "Old Description",
        tag: "work",
        user_id: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        last_modified: new Date().toISOString(),
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedProject,
        error: null,
      });

      // Act
      const result = await service.updateProject(projectId, mockUserId, command);

      // Assert
      expect(result.title).toBe("New Title Only");
      expect(result.description).toBe("Old Description");
    });

    it("should throw 'Project not found' error when project does not exist", async () => {
      // Arrange
      const projectId = "non-existent-id";
      const command: UpdateProjectCommand = {
        title: "Updated Title",
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      // Act & Assert
      await expect(service.updateProject(projectId, mockUserId, command)).rejects.toThrow("Project not found");
    });

    it("should throw an error when validation fails", async () => {
      // Arrange
      const projectId = "project-1";
      const command: UpdateProjectCommand = {
        title: "a".repeat(101), // Exceeds max length
      };

      // Act & Assert
      await expect(service.updateProject(projectId, mockUserId, command)).rejects.toThrow();
    });

    it("should throw an error when database update fails", async () => {
      // Arrange
      const projectId = "project-1";
      const command: UpdateProjectCommand = {
        title: "Updated Title",
      };

      mockQueryBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Update failed", code: "UPDATE_ERROR" },
      });

      // Act & Assert
      await expect(service.updateProject(projectId, mockUserId, command)).rejects.toThrow(
        "Failed to update project: Update failed"
      );
    });
  });

  describe("deleteProject", () => {
    it("should delete a project successfully", async () => {
      // Arrange
      const projectId = "project-1";

      // Mock the chain: from().delete().eq().eq()
      const finalEq = vi.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const firstEq = vi.fn().mockReturnValue({
        eq: finalEq,
      });

      mockQueryBuilder.eq = firstEq;

      // Act
      await service.deleteProject(projectId, mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(firstEq).toHaveBeenCalledWith("id", projectId);
      expect(finalEq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("should complete successfully even when project does not exist", async () => {
      // Arrange - Supabase delete does not fail on non-existent records
      const projectId = "non-existent-id";

      // Mock the chain: from().delete().eq().eq()
      const finalEq = vi.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockQueryBuilder.eq = vi.fn().mockReturnValue({
        eq: finalEq,
      });

      // Act & Assert - Should not throw
      await expect(service.deleteProject(projectId, mockUserId)).resolves.toBeUndefined();
    });

    it("should throw an error when database delete fails", async () => {
      // Arrange
      const projectId = "project-1";

      // Mock the chain: from().delete().eq().eq()
      const finalEq = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: "Deletion failed", code: "DELETE_ERROR" },
      });

      mockQueryBuilder.eq = vi.fn().mockReturnValue({
        eq: finalEq,
      });

      // Act & Assert
      await expect(service.deleteProject(projectId, mockUserId)).rejects.toThrow(
        "Failed to delete project: Deletion failed"
      );
    });

    it("should delete project and cascade delete associated flashcards", async () => {
      // Arrange - This is handled by database CASCADE constraint
      const projectId = "project-with-flashcards";

      // Mock the chain: from().delete().eq().eq()
      const finalEq = vi.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const firstEq = vi.fn().mockReturnValue({
        eq: finalEq,
      });

      mockQueryBuilder.eq = firstEq;

      // Act
      await service.deleteProject(projectId, mockUserId);

      // Assert - Verify delete was called correctly
      // The actual cascade is handled by database, not in service layer
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(firstEq).toHaveBeenCalledWith("id", projectId);
    });
  });
});

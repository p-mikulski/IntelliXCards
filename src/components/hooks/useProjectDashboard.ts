import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { ProjectViewModel } from "@/components/dashboard/types";
import type { CreateProjectCommand, UpdateProjectCommand, ProjectListDto, ProjectDto } from "@/types";

export const useProjectDashboard = (isMobile = false) => {
  const [projects, setProjects] = useState<ProjectViewModel[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 9,
  });
  const [mobile, setMobile] = useState({
    hasMore: false,
    isLoadingMore: false,
    nextPage: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogState, setDialogState] = useState<{
    create: boolean;
    edit: ProjectViewModel | null;
    delete: ProjectViewModel | null;
  }>({
    create: false,
    edit: null,
    delete: null,
  });

  const fetchProjects = useCallback(
    async (page = 1, limit = 9, append = false) => {
      setIsLoading(!append);
      setError(null);
      if (append) {
        setMobile((prev) => ({ ...prev, isLoadingMore: true }));
      }
      try {
        const response = await fetch(`/api/projects?page=${page}&limit=${limit}`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data: ProjectListDto = await response.json();

        const viewModels: ProjectViewModel[] = data.projects.map((p) => ({
          ...p,
          formattedCreatedAt: new Date(p.created_at).toLocaleDateString(),
        }));

        const totalPages = Math.ceil(data.total / data.limit);
        const hasMore = isMobile && data.page < totalPages;

        setProjects((prev) => (append ? [...prev, ...viewModels] : viewModels));
        setPagination({
          currentPage: data.page,
          totalPages,
          totalCount: data.total,
          pageSize: data.limit,
        });
        setMobile({
          hasMore,
          isLoadingMore: false,
          nextPage: data.page + 1,
        });
      } catch (e) {
        setError(e as Error);
        setMobile((prev) => ({ ...prev, isLoadingMore: false }));
      } finally {
        setIsLoading(false);
      }
    },
    [isMobile]
  );

  const loadMoreProjects = useCallback(() => {
    if (isMobile && mobile.hasMore && !mobile.isLoadingMore) {
      fetchProjects(mobile.nextPage, pagination.pageSize, true);
    }
  }, [isMobile, mobile.hasMore, mobile.isLoadingMore, mobile.nextPage, pagination.pageSize, fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: CreateProjectCommand) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticProject: ProjectViewModel = {
      id: tempId,
      title: data.title,
      description: data.description ?? "",
      tag: data.tag ?? "",
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      formattedCreatedAt: new Date().toLocaleDateString(),
      optimisticState: "syncing",
    };

    setProjects((prev) => [optimisticProject, ...prev]);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const newProject: ProjectDto = await response.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                ...p,
                ...newProject,
                formattedCreatedAt: new Date(newProject.created_at).toLocaleDateString(),
                optimisticState: undefined,
              }
            : p
        )
      );

      toast.success(`Project "${newProject.title}" created successfully!`);
      // Refetch projects to ensure the list is up to date
      fetchProjects(1, pagination.pageSize);
    } catch (e) {
      setError(e as Error);
      toast.error(`Failed to create project "${data.title}"`, {
        description: e instanceof Error ? e.message : "An unknown error occurred",
      });
      setProjects((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  const handleUpdateProject = async (projectId: string, data: UpdateProjectCommand) => {
    const originalProjects = projects;
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...data, optimisticState: "syncing" } : p)));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject: ProjectDto = await response.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                ...updatedProject,
                formattedCreatedAt: new Date(updatedProject.created_at).toLocaleDateString(),
                optimisticState: undefined,
              }
            : p
        )
      );

      toast.success(`Project "${updatedProject.title}" updated successfully!`);
    } catch (e) {
      setError(e as Error);
      toast.error(`Failed to update project "${data.title || "Untitled"}"`, {
        description: e instanceof Error ? e.message : "An unknown error occurred",
      });
      setProjects(originalProjects);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const originalProjects = projects;
    const projectToDelete = projects.find((p) => p.id === projectId);
    const projectTitle = projectToDelete?.title || "Untitled";

    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, optimisticState: "deleting" } : p)));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      toast.success(`Project "${projectTitle}" deleted successfully!`);
      // Refetch projects to ensure the list is up to date
      fetchProjects(pagination.currentPage, pagination.pageSize);
    } catch (e) {
      setError(e as Error);
      toast.error(`Failed to delete project "${projectTitle}"`, {
        description: e instanceof Error ? e.message : "An unknown error occurred",
      });
      setProjects(originalProjects);
    }
  };

  const openCreateDialog = () => setDialogState((prev) => ({ ...prev, create: true }));
  const openEditDialog = (project: ProjectViewModel) => setDialogState((prev) => ({ ...prev, edit: project }));
  const openDeleteDialog = (project: ProjectViewModel) => setDialogState((prev) => ({ ...prev, delete: project }));
  const closeDialogs = () => setDialogState({ create: false, edit: null, delete: null });

  const handlePageChange = useCallback(
    (page: number) => {
      fetchProjects(page, pagination.pageSize);
    },
    [fetchProjects, pagination.pageSize]
  );

  return {
    projects,
    pagination,
    mobile,
    isLoading,
    error,
    dialogState,
    fetchProjects,
    loadMoreProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handlePageChange,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
  };
};

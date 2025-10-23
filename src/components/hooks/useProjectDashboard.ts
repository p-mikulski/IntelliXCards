import { useState, useEffect, useCallback } from "react";
import type { ProjectViewModel } from "@/components/dashboard/types";
import type { CreateProjectCommand, UpdateProjectCommand, ProjectListDto, ProjectDto } from "@/types";

export const useProjectDashboard = () => {
  const [projects, setProjects] = useState<ProjectViewModel[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
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

  const fetchProjects = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
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

      setProjects(viewModels);
      setPagination({ page: data.page, limit: data.limit, total: data.total });
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    } catch (e) {
      setError(e as Error);
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
    } catch (e) {
      setError(e as Error);
      setProjects(originalProjects);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const originalProjects = projects;
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, optimisticState: "deleting" } : p)));

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (e) {
      setError(e as Error);
      setProjects(originalProjects);
    }
  };

  const openCreateDialog = () => setDialogState((prev) => ({ ...prev, create: true }));
  const openEditDialog = (project: ProjectViewModel) => setDialogState((prev) => ({ ...prev, edit: project }));
  const openDeleteDialog = (project: ProjectViewModel) => setDialogState((prev) => ({ ...prev, delete: project }));
  const closeDialogs = () => setDialogState({ create: false, edit: null, delete: null });

  return {
    projects,
    pagination,
    isLoading,
    error,
    dialogState,
    fetchProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
  };
};

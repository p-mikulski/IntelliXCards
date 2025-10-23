import React from "react";
import { useProjectDashboard } from "@/components/hooks/useProjectDashboard";
import DashboardHeader from "./DashboardHeader";
import ProjectList from "./ProjectList";
import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import ConfirmDialog from "../common/ConfirmDialog";

const DashboardView = () => {
  const {
    projects,
    pagination,
    isLoading,
    error,
    dialogState,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
  } = useProjectDashboard();

  return (
    <div className="container mx-auto py-8">
      <DashboardHeader projectCount={pagination.total} onOpenCreateDialog={openCreateDialog} />
      {error && <div className="text-red-500">Error: {error.message}</div>}
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onSortChange={() => {}} // Placeholder
        onFilterChange={() => {}} // Placeholder
      />
      <CreateProjectDialog isOpen={dialogState.create} onClose={closeDialogs} onCreate={handleCreateProject} />
      <EditProjectDialog
        isOpen={!!dialogState.edit}
        onClose={closeDialogs}
        onUpdate={handleUpdateProject}
        project={dialogState.edit}
      />
      <ConfirmDialog
        isOpen={!!dialogState.delete}
        onClose={closeDialogs}
        onConfirm={() => dialogState.delete && handleDeleteProject(dialogState.delete.id)}
        project={dialogState.delete}
      />
    </div>
  );
};

export default DashboardView;

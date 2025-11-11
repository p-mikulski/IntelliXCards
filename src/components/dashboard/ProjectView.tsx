import React from "react";
import { useProjectDashboard } from "@/components/hooks/useProjectDashboard";
import ProjectHeader from "./ProjectHeader";
import ProjectList from "./ProjectList";
import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import ConfirmDialog from "../common/ConfirmDialog";
import SkeletonLoader from "../common/SkeletonLoader";
import { Pagination } from "@/components/ui/pagination";

const ProjectView: React.FC = () => {
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
    handlePageChange,
  } = useProjectDashboard();

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <ProjectHeader projectCount={pagination.totalCount} onOpenCreateDialog={openCreateDialog} />

      <div className="flex-1 w-full py-4 px-20 space-y-4 bg-muted overflow-auto">
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg"
            role="alert"
          >
            <p className="font-medium">Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Show skeleton only while loading projects */}
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <ProjectList projects={projects} onEdit={openEditDialog} onDelete={openDeleteDialog} />

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              showRange={true}
              currentPageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
            />
          </>
        )}
      </div>

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

export default ProjectView;

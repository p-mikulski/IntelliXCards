import React, { useEffect, useRef } from "react";
import { useProjectDashboard } from "@/components/hooks/useProjectDashboard";
import { useIsMobile } from "@/components/hooks/useIsMobile";
import ProjectHeader from "./ProjectHeader";
import ProjectList from "./ProjectList";
import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import ConfirmDialog from "../common/ConfirmDialog";
import SkeletonLoader from "../common/SkeletonLoader";
import { Pagination } from "@/components/ui/pagination";

const ProjectView: React.FC = () => {
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    projects,
    pagination,
    mobile,
    isLoading,
    error,
    dialogState,
    loadMoreProjects,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handlePageChange,
  } = useProjectDashboard(isMobile);

  // Set up intersection observer for mobile infinite scroll
  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && mobile.hasMore && !mobile.isLoadingMore) {
          loadMoreProjects();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [isMobile, mobile.hasMore, mobile.isLoadingMore, loadMoreProjects]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <ProjectHeader projectCount={pagination.totalCount} onOpenCreateDialog={openCreateDialog} />

      <div className="flex-1 w-full py-4 px-5 sm:px-5 md:px-25 lg:px-45 space-y-4 bg-muted overflow-auto">
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

            {/* Sentinel for mobile infinite scroll */}
            {isMobile && mobile.hasMore && (
              <div ref={sentinelRef} className="h-4 flex items-center justify-center">
                {mobile.isLoadingMore && <SkeletonLoader />}
              </div>
            )}

            {/* Pagination Controls - only show for desktop and when there are 10 or more projects */}
            {!isMobile && pagination.totalCount >= 10 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                showRange={true}
                currentPageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
              />
            )}
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

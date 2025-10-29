import { useProjectDetail } from "@/components/hooks/useProjectDetail";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import ProjectHeader from "./ProjectHeader";
import FlashcardListToolbar from "./FlashcardListToolbar";
import FlashcardList from "./FlashcardList";
import CreateFlashcardDialog from "./CreateFlashcardDialog";
import EditFlashcardDialog from "./EditFlashcardDialog";
import { Pagination } from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectDetailViewProps {
  projectId: string;
}

/**
 * Main container component for the Project Detail view
 * Orchestrates the entire view, fetches data, and manages state
 */
export default function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const {
    viewModel,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleBatchDeleteFlashcards,
    handlePageChange,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    openBatchDeleteDialog,
    closeDialogs,
    toggleSelectFlashcard,
    selectAllFlashcards,
    unselectAllFlashcards,
  } = useProjectDetail(projectId);

  // Error state - show error if critical data failed to load
  if (viewModel.error && !viewModel.project) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm">{viewModel.error}</p>
        </div>
      </div>
    );
  }

  // Project not found - only show after loading is complete
  if (!viewModel.isLoading && !viewModel.project) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div
          className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-500 px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="font-medium">Project not found</p>
          <p className="text-sm">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Always render ProjectHeader - show loading state if project not yet loaded */}
      <ProjectHeader
        project={viewModel.project || undefined}
        onStudyClick={() => {
          window.location.href = `/projects/${projectId}/study`;
        }}
        onCreateClick={openCreateDialog}
        onGenerateAIClick={() => {
          window.location.href = `/projects/${projectId}/generate`;
        }}
        isLoading={!viewModel.project}
      />

      <div className="w-full py-4 px-90 space-y-4 bg-muted">
        {/* Always render FlashcardListToolbar - show with 0 count if not loaded yet */}
        <FlashcardListToolbar
          flashcardCount={viewModel.pagination.totalCount}
          selectedCount={viewModel.selection.selectedIds.size}
          onDeleteSelected={openBatchDeleteDialog}
          onSelectAll={selectAllFlashcards}
          onUnselectAll={unselectAllFlashcards}
        />

        {/* Show skeleton only while loading flashcards */}
        {viewModel.isLoadingFlashcards ? (
          <SkeletonLoader />
        ) : (
          <>
            <FlashcardList
              flashcards={viewModel.flashcards}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              selectedIds={viewModel.selection.selectedIds}
              onToggleSelect={toggleSelectFlashcard}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={viewModel.pagination.currentPage}
              totalPages={viewModel.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <CreateFlashcardDialog
          isOpen={viewModel.dialogs.create.isOpen}
          onClose={closeDialogs}
          onSubmit={handleCreateFlashcard}
          isSubmitting={viewModel.isSubmitting}
        />

        <EditFlashcardDialog
          isOpen={viewModel.dialogs.edit.isOpen}
          onClose={closeDialogs}
          onSubmit={(data) => {
            if (viewModel.dialogs.edit.flashcardId) {
              handleUpdateFlashcard(viewModel.dialogs.edit.flashcardId, data);
            }
          }}
          flashcard={
            viewModel.dialogs.edit.flashcardId
              ? viewModel.flashcards.find((f) => f.id === viewModel.dialogs.edit.flashcardId) || null
              : null
          }
          isSubmitting={viewModel.isSubmitting}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={viewModel.dialogs.delete.isOpen} onOpenChange={(open) => !open && closeDialogs()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this flashcard? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (viewModel.dialogs.delete.flashcardId) {
                    handleDeleteFlashcard(viewModel.dialogs.delete.flashcardId);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Batch Delete Confirmation Dialog */}
        <AlertDialog open={viewModel.dialogs.batchDelete.isOpen} onOpenChange={(open) => !open && closeDialogs()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Flashcards</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {viewModel.selection.selectedIds.size} flashcard(s)? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDialogs}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleBatchDeleteFlashcards();
                }}
                className="bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
              >
                Delete {viewModel.selection.selectedIds.size} Flashcard(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

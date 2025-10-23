import { useProjectDetail } from "@/components/hooks/useProjectDetail";
import SkeletonLoader from "@/components/common/SkeletonLoader";
import ProjectHeader from "./ProjectHeader";
import FlashcardListToolbar from "./FlashcardListToolbar";
import FlashcardList from "./FlashcardList";
import CreateFlashcardDialog from "./CreateFlashcardDialog";
import EditFlashcardDialog from "./EditFlashcardDialog";
import { toast } from "sonner";
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
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
  } = useProjectDetail(projectId);

  // Loading state
  if (viewModel.isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <SkeletonLoader />
      </div>
    );
  }

  // Error state
  if (viewModel.error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
          <p className="font-medium">Error</p>
          <p className="text-sm">{viewModel.error}</p>
        </div>
      </div>
    );
  }

  // Project not found
  if (!viewModel.project) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg" role="alert">
          <p className="font-medium">Project not found</p>
          <p className="text-sm">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProjectHeader
        project={viewModel.project}
        onStudyClick={() => {
          toast.info("Study session feature coming soon!", {
            description: "This feature will allow you to practice your flashcards.",
          });
        }}
        onGenerateAIClick={() => {
          toast.info("AI generation feature coming soon!", {
            description: "This feature will use AI to generate flashcards from your text.",
          });
        }}
      />

      <FlashcardListToolbar flashcardCount={viewModel.flashcards.length} onCreateClick={openCreateDialog} />

      <FlashcardList flashcards={viewModel.flashcards} onEdit={openEditDialog} onDelete={openDeleteDialog} />

      {/* Create Flashcard Dialog */}
      <CreateFlashcardDialog
        isOpen={viewModel.dialogs.create.isOpen}
        onClose={closeDialogs}
        onSubmit={handleCreateFlashcard}
        isSubmitting={viewModel.isSubmitting}
      />

      {/* Edit Flashcard Dialog */}
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
    </div>
  );
}

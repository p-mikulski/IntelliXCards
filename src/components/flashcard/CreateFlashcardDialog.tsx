import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FlashcardForm from "./FlashcardForm";
import type { CreateFlashcardCommand } from "@/types";

interface CreateFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardCommand) => void;
  isSubmitting?: boolean;
}

/**
 * Modal dialog for creating a new flashcard
 * Contains FlashcardForm with validation
 */
export default function CreateFlashcardDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateFlashcardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Flashcard</DialogTitle>
          <DialogDescription>
            Add a new flashcard to your project. Fill in both the front (question) and back (answer).
          </DialogDescription>
        </DialogHeader>
        <FlashcardForm onSubmit={onSubmit} onCancel={onClose} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}

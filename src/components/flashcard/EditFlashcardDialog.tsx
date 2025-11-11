import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FlashcardForm from "./FlashcardForm";
import type { CreateFlashcardCommand, FlashcardListItemDto } from "@/types";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardCommand) => void;
  flashcard: FlashcardListItemDto | null;
  isSubmitting?: boolean;
}

/**
 * Modal dialog for editing an existing flashcard
 * Reuses FlashcardForm with pre-populated data
 */
export default function EditFlashcardDialog({
  isOpen,
  onClose,
  onSubmit,
  flashcard,
  isSubmitting = false,
}: EditFlashcardDialogProps) {
  if (!flashcard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
          <DialogDescription>Update the front (question) or back (answer) of your flashcard.</DialogDescription>
        </DialogHeader>
        <FlashcardForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={{ front: flashcard.front, back: flashcard.back }}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

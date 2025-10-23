import type { FlashcardListItemDto } from "@/types";
import FlashcardListItem from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardListItemDto[];
  onEdit: (flashcardId: string) => void;
  onDelete: (flashcardId: string) => void;
}

/**
 * Renders the list of flashcards
 * Shows an empty state when no flashcards exist
 */
export default function FlashcardList({ flashcards, onEdit, onDelete }: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">📚</p>
        <p className="mt-2 text-gray-600 font-medium">No flashcards yet</p>
        <p className="text-sm text-gray-500">Create your first flashcard to start learning!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={() => onEdit(flashcard.id)}
          onDelete={() => onDelete(flashcard.id)}
        />
      ))}
    </div>
  );
}

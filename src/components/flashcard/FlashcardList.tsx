import type { FlashcardListItemDto } from "@/types";
import FlashcardListItem from "./FlashcardListItem";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardListProps {
  flashcards: FlashcardListItemDto[];
  onEdit: (flashcardId: string) => void;
  onDelete: (flashcardId: string) => void;
  onMove: (flashcardId: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (flashcardId: string) => void;
}

/**
 * Renders the list of flashcards
 * Shows an empty state when no flashcards exist
 */
export default function FlashcardList({
  flashcards,
  onEdit,
  onDelete,
  onMove,
  selectedIds,
  onToggleSelect,
}: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-4xl mb-4">📚</p>
          <p className="mt-2 font-medium">No flashcards yet</p>
          <p className="text-sm text-muted-foreground">Create your first flashcard to start learning!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={() => onEdit(flashcard.id)}
          onDelete={() => onDelete(flashcard.id)}
          onMove={() => onMove(flashcard.id)}
          isSelected={selectedIds?.has(flashcard.id)}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(flashcard.id) : undefined}
        />
      ))}
    </div>
  );
}

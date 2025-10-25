import { Button } from "@/components/ui/button";

interface FlashcardListToolbarProps {
  flashcardCount: number;
  onCreateClick: () => void;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({ flashcardCount, onCreateClick }: FlashcardListToolbarProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Flashcards ({flashcardCount})</h2>
      <Button onClick={onCreateClick} type="button">
        Create Flashcard
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, Square } from "lucide-react";

interface FlashcardListToolbarProps {
  flashcardCount: number;
  onCreateClick: () => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({
  flashcardCount,
  onCreateClick,
  selectedCount = 0,
  onDeleteSelected,
  onSelectAll,
  onUnselectAll,
}: FlashcardListToolbarProps) {
  const allSelected = selectedCount === flashcardCount && flashcardCount > 0;

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          Flashcards ({flashcardCount})
          {selectedCount > 0 && <span className="text-primary ml-2">• {selectedCount} selected</span>}
        </h2>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateClick} type="button">
          Create Flashcard
        </Button>
        {selectedCount > 0 && onDeleteSelected && (
          <Button onClick={onDeleteSelected} variant="destructive" size="default" type="button">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedCount})
          </Button>
        )}
        {!allSelected && onSelectAll && (
          <Button onClick={onSelectAll} variant="outline" size="default" type="button" disabled={flashcardCount === 0}>
            <CheckSquare className="w-4 h-4 mr-2" />
            Select All
          </Button>
        )}
        {allSelected && onUnselectAll && (
          <Button onClick={onUnselectAll} variant="outline" size="default" type="button">
            <Square className="w-4 h-4 mr-2" />
            Unselect All
          </Button>
        )}
      </div>
    </div>
  );
}

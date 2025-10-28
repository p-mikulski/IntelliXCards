import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FlashcardListToolbarProps {
  flashcardCount: number;
  onCreateClick: () => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onToggleSelectMode?: () => void;
  isSelectMode?: boolean;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({
  flashcardCount,
  onCreateClick,
  selectedCount = 0,
  onDeleteSelected,
  onToggleSelectMode,
  isSelectMode = false,
}: FlashcardListToolbarProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          Flashcards ({flashcardCount})
          {selectedCount > 0 && <span className="text-primary ml-2">• {selectedCount} selected</span>}
        </h2>
      </div>
      <div className="flex gap-2">
        {selectedCount > 0 && onDeleteSelected && (
          <Button onClick={onDeleteSelected} variant="destructive" size="default" type="button">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedCount})
          </Button>
        )}
        {onToggleSelectMode && (
          <Button onClick={onToggleSelectMode} variant="outline" type="button">
            {isSelectMode ? "Cancel Selection" : "Select Multiple"}
          </Button>
        )}
        <Button onClick={onCreateClick} type="button">
          Create Flashcard
        </Button>
      </div>
    </div>
  );
}

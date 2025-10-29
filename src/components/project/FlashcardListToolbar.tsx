import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, Square } from "lucide-react";

interface FlashcardListToolbarProps {
  flashcardCount: number;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({
  flashcardCount,
  selectedCount = 0,
  onDeleteSelected,
  onSelectAll,
  onUnselectAll,
  totalCount,
  currentPage,
  pageSize,
}: FlashcardListToolbarProps) {
  const allSelected = selectedCount === flashcardCount && flashcardCount > 0;

  // Calculate the range of items being displayed
  const getItemRange = () => {
    if (!totalCount || !currentPage || !pageSize) {
      return `Flashcards (${flashcardCount})`;
    }

    if (totalCount === 0) {
      return "Flashcards (0)";
    }

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return `Flashcards (${startItem}-${endItem} of ${totalCount})`;
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          {getItemRange()}
          {selectedCount > 0 && <span className="text-primary ml-2">• {selectedCount} selected</span>}
        </h2>
      </div>
      <div className="flex gap-2">
        {selectedCount > 0 && onDeleteSelected && (
          <Button onClick={onDeleteSelected} variant="destructive" size="sm" type="button">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedCount})
          </Button>
        )}
        {!allSelected && onSelectAll && (
          <Button onClick={onSelectAll} variant="outline" size="sm" type="button" disabled={flashcardCount === 0}>
            <CheckSquare className="w-4 h-4 mr-2" />
            Select All
          </Button>
        )}
        {allSelected && onUnselectAll && (
          <Button onClick={onUnselectAll} variant="outline" size="sm" type="button">
            <Square className="w-4 h-4 mr-2" />
            Unselect All
          </Button>
        )}
      </div>
    </div>
  );
}

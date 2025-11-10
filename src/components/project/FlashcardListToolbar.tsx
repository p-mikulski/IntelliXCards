import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, Square, FolderInput, MoreVertical } from "lucide-react";
import { useState } from "react";

interface FlashcardListToolbarProps {
  flashcardCount: number;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  onMoveSelected?: () => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({
  flashcardCount,
  selectedCount = 0,
  onDeleteSelected,
  onMoveSelected,
  onSelectAll,
  onUnselectAll,
}: FlashcardListToolbarProps) {
  const allSelected = selectedCount === flashcardCount && flashcardCount > 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Flashcards</h2>
        </div>
        <div className="flex gap-2 items-center hidden sm:flex">
          {selectedCount > 0 && (
            <div className="border-r border-gray-300 pr-4 mr-3">
              <span className="text-primary text-sm">{selectedCount} selected</span>
            </div>
          )}
          {selectedCount > 0 && onMoveSelected && (
            <Button onClick={onMoveSelected} variant="outline" size="sm" type="button">
              <FolderInput className="w-4 h-4 mr-2" />
              Move
            </Button>
          )}
          {selectedCount > 0 && onDeleteSelected && (
            <Button onClick={onDeleteSelected} variant="destructive" size="sm" type="button">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
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
        <div className="relative sm:hidden">
          <Button onClick={() => setMenuOpen(!menuOpen)} variant="outline" size="sm" type="button">
            <MoreVertical className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg p-2 z-10 flex flex-col gap-2">
              {selectedCount > 0 && (
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <span className="text-primary text-sm">{selectedCount} selected</span>
                </div>
              )}
              {selectedCount > 0 && onMoveSelected && (
                <Button
                  onClick={() => {
                    onMoveSelected();
                    setMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <FolderInput className="w-4 h-4 mr-2" />
                  Move
                </Button>
              )}
              {selectedCount > 0 && onDeleteSelected && (
                <Button
                  onClick={() => {
                    onDeleteSelected();
                    setMenuOpen(false);
                  }}
                  variant="destructive"
                  size="sm"
                  type="button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              {!allSelected && onSelectAll && (
                <Button
                  onClick={() => {
                    onSelectAll();
                    setMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={flashcardCount === 0}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select All
                </Button>
              )}
              {allSelected && onUnselectAll && (
                <Button
                  onClick={() => {
                    onUnselectAll();
                    setMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Unselect All
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { FlashcardListItemDto } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";

interface FlashcardListItemProps {
  flashcard: FlashcardListItemDto;
  onEdit: () => void;
  onDelete: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

/**
 * Represents a single flashcard in the list
 * Displays front/back content and action buttons
 */
export default function FlashcardListItem({
  flashcard,
  onEdit,
  onDelete,
  isSelected = false,
  onToggleSelect,
}: FlashcardListItemProps) {
  const handleCardClick = () => {
    // If we have selection enabled, clicking should select, not edit
    if (onToggleSelect) {
      onToggleSelect();
    } else {
      onEdit();
    }
  };

  return (
    <Card
      className={`min-h-[200px] hover:border-foreground cursor-pointer relative group ${
        isSelected ? "border-foreground" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="flex flex-col gap-4">
        {/* Checkbox in top-left corner */}
        {onToggleSelect && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {
                onToggleSelect();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              aria-label={`Select flashcard: ${flashcard.front}`}
            />
          </div>
        )}

        <div>
          <p className="font-semibold text-lg line-clamp-2 break-words">{flashcard.front}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground break-words">{flashcard.back}</p>
        </div>

        {flashcard.feedback && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last feedback: <span className="font-medium capitalize text-foreground">{flashcard.feedback}</span>
            </p>
          </div>
        )}
      </CardContent>

      <Trash
        className="absolute top-2 right-2 w-5 h-5 opacity-0 group-hover:opacity-100 text-destructive/30 hover:text-destructive/80 cursor-pointer transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete flashcard: ${flashcard.front}`}
      />
    </Card>
  );
}

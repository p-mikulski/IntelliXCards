import type { FlashcardListItemDto } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trash } from "lucide-react";

interface FlashcardListItemProps {
  flashcard: FlashcardListItemDto;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Represents a single flashcard in the list
 * Displays front/back content and action buttons
 */
export default function FlashcardListItem({ flashcard, onEdit, onDelete }: FlashcardListItemProps) {
  return (
    <Card className="min-h-[200px] hover:border-foreground cursor-pointer relative group" onClick={onEdit}>
      <CardContent className="flex flex-col gap-4">
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

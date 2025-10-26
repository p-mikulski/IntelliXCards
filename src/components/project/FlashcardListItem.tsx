import type { FlashcardListItemDto } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="min-h-[200px]">
      <CardContent className="pt-6 flex flex-col gap-4">
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

      <CardFooter className="justify-end gap-2 border-t h-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          type="button"
          aria-label={`Edit flashcard: ${flashcard.front}`}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          type="button"
          aria-label={`Delete flashcard: ${flashcard.front}`}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

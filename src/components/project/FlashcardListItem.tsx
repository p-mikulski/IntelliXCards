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
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Front</h3>
            <p className="break-words">{flashcard.front}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Back</h3>
            <p className="break-words">{flashcard.back}</p>
          </div>
        </div>

        {flashcard.feedback && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last feedback: <span className="font-medium capitalize text-foreground">{flashcard.feedback}</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t">
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

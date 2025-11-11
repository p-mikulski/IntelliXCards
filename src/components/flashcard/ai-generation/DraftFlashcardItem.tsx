/**
 * DraftFlashcardItem component
 * Individual editable flashcard draft in the review list
 */

import { useState, type ChangeEvent } from "react";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DraftFlashcardItemProps } from "./types";
import type { FlashcardDraft } from "@/types";

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export default function DraftFlashcardItem({ draft, onUpdate, onDelete, onFeedback }: DraftFlashcardItemProps) {
  const [localFront, setLocalFront] = useState(draft.front);
  const [localBack, setLocalBack] = useState(draft.back);

  const handleFrontChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalFront(value);
    const updates: Partial<FlashcardDraft> = { front: value };
    onUpdate(draft.id, updates);
  };

  const handleBackChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalBack(value);
    const updates: Partial<FlashcardDraft> = { back: value };
    onUpdate(draft.id, updates);
  };

  const handleDelete = () => {
    onDelete(draft.id);
  };

  const handleFeedbackUp = () => {
    onFeedback(draft.id, "up");
  };

  const handleFeedbackDown = () => {
    onFeedback(draft.id, "down");
  };

  const isFrontValid = localFront.length > 0 && localFront.length <= MAX_FRONT_LENGTH;
  const isBackValid = localBack.length > 0 && localBack.length <= MAX_BACK_LENGTH;

  return (
    <Card className={!isFrontValid || !isBackValid ? "border-destructive" : ""}>
      <CardContent className="pt-6 space-y-4">
        {/* Front Content */}
        <div className="space-y-2">
          <Label htmlFor={`front-${draft.id}`}>
            Front (Question)
            <span className="text-destructive ml-1">*</span>
          </Label>
          <textarea
            id={`front-${draft.id}`}
            value={localFront}
            onChange={handleFrontChange}
            rows={3}
            placeholder="Enter the question or prompt..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
            aria-describedby={`front-counter-${draft.id}`}
          />
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {!isFrontValid && localFront.length > MAX_FRONT_LENGTH && (
                <p className="text-sm text-destructive">Front must not exceed {MAX_FRONT_LENGTH} characters</p>
              )}
              {!isFrontValid && localFront.length === 0 && (
                <p className="text-sm text-destructive">Front cannot be empty</p>
              )}
            </div>
            <p
              id={`front-counter-${draft.id}`}
              className={`text-sm ${
                localFront.length > MAX_FRONT_LENGTH ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {localFront.length} / {MAX_FRONT_LENGTH}
            </p>
          </div>
        </div>

        {/* Back Content */}
        <div className="space-y-2">
          <Label htmlFor={`back-${draft.id}`}>
            Back (Answer)
            <span className="text-destructive ml-1">*</span>
          </Label>
          <textarea
            id={`back-${draft.id}`}
            value={localBack}
            onChange={handleBackChange}
            rows={5}
            placeholder="Enter the answer or explanation..."
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
            aria-describedby={`back-counter-${draft.id}`}
          />
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {!isBackValid && localBack.length > MAX_BACK_LENGTH && (
                <p className="text-sm text-destructive">Back must not exceed {MAX_BACK_LENGTH} characters</p>
              )}
              {!isBackValid && localBack.length === 0 && (
                <p className="text-sm text-destructive">Back cannot be empty</p>
              )}
            </div>
            <p
              id={`back-counter-${draft.id}`}
              className={`text-sm ${localBack.length > MAX_BACK_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
            >
              {localBack.length} / {MAX_BACK_LENGTH}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={draft.feedback === "up" ? "default" : "outline"}
              size="sm"
              onClick={handleFeedbackUp}
              aria-label="Thumbs up"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={draft.feedback === "down" ? "default" : "outline"}
              size="sm"
              onClick={handleFeedbackDown}
              aria-label="Thumbs down"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete} aria-label="Delete draft">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

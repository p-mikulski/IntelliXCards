import type { FlashcardListItemDto } from "@/types";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Pencil, Trash2, FolderInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FlashcardListItemProps {
  flashcard: FlashcardListItemDto;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
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
  onMove,
  isSelected = false,
  onToggleSelect,
}: FlashcardListItemProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on actions button or checkbox
    if (
      (e.target as HTMLElement).closest("[data-dropdown-trigger]") ||
      (e.target as HTMLElement).closest("[data-checkbox]")
    ) {
      e.preventDefault();
      return;
    }

    // If we have selection enabled, clicking should select
    if (onToggleSelect) {
      onToggleSelect();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect();
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Card
      className={`min-h-[200px] cursor-pointer relative transition-all group ${
        isSelected ? "ring-2 ring-primary border-primary" : "hover:border-ring"
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onToggleSelect) {
            onToggleSelect();
          }
        }
      }}
    >
      <CardContent className="flex flex-col gap-4">
        {/* Checkbox in top-left corner - only visible when selected */}
        {onToggleSelect && isSelected && (
          <div
            role="button"
            tabIndex={0}
            className="absolute -top-2 -left-2 h-6 w-6 z-10 bg-background rounded-full"
            onClick={handleCheckboxClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCheckboxClick(e as unknown as React.MouseEvent);
              }
            }}
            data-checkbox
            aria-label={isSelected ? "Deselect flashcard" : "Select flashcard"}
          >
            <Checkbox checked={isSelected} className="rounded-full border-2 border-primary/60" />
          </div>
        )}

        {/* Three-dot menu in top-right corner */}
        <div className="absolute top-2 right-2 z-10" data-dropdown-trigger>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`h-8 w-8 p-0 transition-opacity ${
                  isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  handleAction(e, onEdit);
                  setIsMenuOpen(false);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  handleAction(e, onMove);
                  setIsMenuOpen(false);
                }}
              >
                <FolderInput className="mr-2 h-4 w-4" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  handleAction(e, onDelete);
                  setIsMenuOpen(false);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
    </Card>
  );
}

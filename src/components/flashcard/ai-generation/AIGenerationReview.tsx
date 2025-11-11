/**
 * AIGenerationReview component
 * Displays list of AI-generated flashcard drafts for review and editing
 */

import { useState } from "react";
import { Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DraftFlashcardItem from "./DraftFlashcardItem";
import type { AIGenerationReviewProps } from "./types";

export default function AIGenerationReview({
  projectId,
  drafts,
  isSaving,
  saveProgress,
  onSaveAll,
  onUpdateDraft,
  onDeleteDraft,
  onDiscardAll,
  onFeedback,
}: AIGenerationReviewProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const handleDiscardAll = () => {
    setShowDiscardDialog(true);
  };

  const confirmDiscardAll = () => {
    setShowDiscardDialog(false);
    onDiscardAll();
  };

  const cancelDiscardAll = () => {
    setShowDiscardDialog(false);
  };

  const allDraftsValid = drafts.every(
    (draft) => draft.front.length > 0 && draft.front.length <= 200 && draft.back.length > 0 && draft.back.length <= 500
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </a>
          </li>
          <li className="text-gray-400" aria-hidden="true">
            /
          </li>
          <li>
            <a href={`/projects/${projectId}`} className="text-gray-600 hover:text-gray-900 transition-colors">
              Project
            </a>
          </li>
          <li className="text-gray-400" aria-hidden="true">
            /
          </li>
          <li className="text-gray-900 font-medium" aria-current="page">
            Review Flashcards
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Generated Flashcards</h1>
          <p className="text-muted-foreground mt-2">
            Review and edit your AI-generated flashcards before saving them to your project.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {isSaving && saveProgress ? (
              <>
                Saving {saveProgress.current} of {saveProgress.total} flashcards...
              </>
            ) : (
              <>
                {drafts.length} flashcard{drafts.length !== 1 ? "s" : ""} ready to save
              </>
            )}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardAll}
              disabled={drafts.length === 0 || isSaving}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Discard All
            </Button>
            <Button type="button" onClick={onSaveAll} disabled={drafts.length === 0 || !allDraftsValid || isSaving}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Save Progress Bar */}
        {isSaving && saveProgress && (
          <div className="space-y-2">
            <Progress value={(saveProgress.current / saveProgress.total) * 100} />
            <p className="text-xs text-center text-muted-foreground">
              {saveProgress.current} of {saveProgress.total} flashcards saved
            </p>
          </div>
        )}

        {/* Validation Warning */}
        {!allDraftsValid && drafts.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm text-destructive">
              Some flashcards have validation errors. Please fix them before saving.
            </p>
          </div>
        )}
      </div>

      {/* Draft List */}
      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drafts available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <DraftFlashcardItem
              key={draft.id}
              draft={draft}
              onUpdate={onUpdateDraft}
              onDelete={onDeleteDraft}
              onFeedback={onFeedback}
            />
          ))}
        </div>
      )}

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard all drafts?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All {drafts.length} draft flashcard
              {drafts.length !== 1 ? "s" : ""} will be permanently deleted and you will return to the generation form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDiscardAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardAll}>Discard All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

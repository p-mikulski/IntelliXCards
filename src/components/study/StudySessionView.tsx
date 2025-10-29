import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import SkeletonLoader from "../common/SkeletonLoader";
import EmptyState from "../common/EmptyState";
import { useStudySession } from "../hooks/useStudySession";
import { FlashcardDisplay } from "./FlashcardDisplay";
import { RecallFeedbackButtons } from "./RecallFeedbackButtons";
import StudySessionHeader from "./StudySessionHeader";

type RecallDifficulty = "easy" | "good" | "hard";

interface StudySessionViewProps {
  projectId: string;
}

/**
 * Main view component for study sessions
 * Displays flashcards for study using spaced repetition algorithm
 */
export default function StudySessionView({ projectId }: StudySessionViewProps) {
  const { currentFlashcard, isLoading, error, studyProgress, submitFeedback, endSession } = useStudySession(projectId);

  const [isFlipped, setIsFlipped] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentFlashcard?.id]);

  const handleReveal = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleFeedback = useCallback(
    async (difficulty: RecallDifficulty) => {
      if (!currentFlashcard) return;

      await submitFeedback(currentFlashcard.id, difficulty);
      setIsFlipped(false);
    },
    [currentFlashcard, submitFeedback]
  );

  const handleExitConfirm = useCallback(async () => {
    await endSession();
    window.location.href = `/projects/${projectId}`;
  }, [endSession, projectId]);

  const handleExitCancel = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyState
          title="Error Loading Study Session"
          description={error}
          actionText="Return to Project"
          onAction={() => (window.location.href = `/projects/${projectId}`)}
        />
      </div>
    );
  }

  // No cards to study
  if (!currentFlashcard) {
    return (
      <div className="container mx-auto py-8 px-4">
        <EmptyState
          title="No Cards to Study"
          description="You've completed all your cards for now! Come back later for more practice."
          actionText="Return to Project"
          onAction={() => (window.location.href = `/projects/${projectId}`)}
        />
      </div>
    );
  }

  const progressPercentage = studyProgress.total > 0 ? (studyProgress.completed / studyProgress.total) * 100 : 0;

  return (
    <>
      <StudySessionHeader
        currentCard={studyProgress.completed + 1}
        totalCards={studyProgress.total}
        progressPercentage={progressPercentage}
        onExitClick={() => setShowExitDialog(true)}
      />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Flashcard display */}
        <FlashcardDisplay front={currentFlashcard.front} back={currentFlashcard.back} isFlipped={isFlipped} />

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {!isFlipped ? (
            <Button size="lg" onClick={handleReveal} className="w-full max-w-md" aria-label="Reveal answer">
              Reveal Answer
            </Button>
          ) : (
            <RecallFeedbackButtons onFeedback={handleFeedback} disabled={false} />
          )}
        </div>

        {/* Exit confirmation dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit Study Session?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be saved. You can continue studying later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleExitCancel}>Continue Studying</AlertDialogCancel>
              <AlertDialogAction onClick={handleExitConfirm}>Exit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

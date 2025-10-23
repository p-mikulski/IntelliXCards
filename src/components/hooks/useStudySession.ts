import { useState, useEffect, useCallback } from "react";
import type { FlashcardDto, StudySessionDto } from "@/types";

type RecallDifficulty = "easy" | "good" | "hard";

interface StudyProgress {
  completed: number;
  total: number;
}

interface UseStudySessionReturn {
  currentFlashcard: FlashcardDto | null;
  isLoading: boolean;
  error: string | null;
  studyProgress: StudyProgress;
  startSession: () => Promise<void>;
  submitFeedback: (flashcardId: string, difficulty: RecallDifficulty) => Promise<void>;
  endSession: () => Promise<void>;
}

/**
 * Custom hook for managing study session state and operations
 * Handles fetching flashcards, tracking progress, and submitting feedback
 */
export function useStudySession(projectId: string): UseStudySessionReturn {
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardDto | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<StudySessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch flashcards due for review
  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all flashcards for the project
      const response = await fetch(`/api/projects/${projectId}/flashcards`);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data = await response.json();
      const allFlashcards: FlashcardDto[] = data.flashcards || [];

      // For study sessions, we want to show:
      // 1. Cards without a review date (newly created, never studied)
      // 2. Cards with review date in the past or today
      const now = new Date();
      const dueFlashcards = allFlashcards.filter((card) => {
        if (!card.next_review_date) return true; // New cards without review date
        const reviewDate = new Date(card.next_review_date);
        return reviewDate <= now;
      });

      // If no cards are due but there are cards available, show all cards
      // This handles the case where all cards have future review dates (e.g., just created with default +1 day)
      const cardsToStudy = dueFlashcards.length > 0 ? dueFlashcards : allFlashcards;

      setFlashcards(cardsToStudy);

      if (cardsToStudy.length > 0) {
        setCurrentFlashcard(cardsToStudy[0]);
      } else {
        setCurrentFlashcard(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Start a new study session
  const startSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/study-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start study session");
      }

      const sessionData = await response.json();
      setSession(sessionData);

      // Store session ID in sessionStorage for persistence
      sessionStorage.setItem(`study-session-${projectId}`, sessionData.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error starting session:", err);
    }
  }, [projectId]);

  // Submit feedback for a flashcard
  const submitFeedback = useCallback(
    async (flashcardId: string, difficulty: RecallDifficulty) => {
      try {
        // Calculate new ease factor and next review date based on difficulty
        const now = new Date();
        let interval: number; // days
        let easeFactor = currentFlashcard?.ease_factor || 2.5;

        switch (difficulty) {
          case "easy":
            interval = 4;
            easeFactor = Math.min(easeFactor + 0.15, 3.0);
            break;
          case "good":
            interval = 2;
            break;
          case "hard":
            interval = 1;
            easeFactor = Math.max(easeFactor - 0.15, 1.3);
            break;
        }

        const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

        // Update flashcard with new spaced repetition data
        const response = await fetch(`/api/projects/${projectId}/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            next_review_date: nextReviewDate.toISOString(),
            ease_factor: easeFactor,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit feedback");
        }

        // Move to next card
        const nextIndex = currentIndex + 1;
        if (nextIndex < flashcards.length) {
          setCurrentIndex(nextIndex);
          setCurrentFlashcard(flashcards[nextIndex]);
        } else {
          setCurrentFlashcard(null); // No more cards
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error submitting feedback:", err);
        setError(err instanceof Error ? err.message : "Failed to submit feedback");
      }
    },
    [projectId, currentIndex, flashcards, currentFlashcard]
  );

  // End the current study session
  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      await fetch(`/api/study-sessions/${session.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          end_time: new Date().toISOString(),
          cards_reviewed: currentIndex,
        }),
      });

      // Clear session from storage
      sessionStorage.removeItem(`study-session-${projectId}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error ending session:", err);
    }
  }, [session, currentIndex, projectId]);

  // Initialize: Fetch flashcards and start session
  useEffect(() => {
    fetchFlashcards();
    startSession();
  }, [fetchFlashcards, startSession]);

  // Calculate progress
  const studyProgress: StudyProgress = {
    completed: currentIndex,
    total: flashcards.length,
  };

  return {
    currentFlashcard,
    isLoading,
    error,
    studyProgress,
    startSession,
    submitFeedback,
    endSession,
  };
}

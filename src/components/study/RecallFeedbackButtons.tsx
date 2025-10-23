import { Button } from "../ui/button";

type RecallDifficulty = "easy" | "good" | "hard";

interface RecallFeedbackButtonsProps {
  onFeedback: (difficulty: RecallDifficulty) => void;
  disabled?: boolean;
}

/**
 * Component that displays recall feedback buttons (Easy, Good, Hard)
 * Allows users to rate how well they recalled the flashcard answer
 */
export function RecallFeedbackButtons({ onFeedback, disabled = false }: RecallFeedbackButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
      <Button
        variant="outline"
        size="lg"
        onClick={() => onFeedback("hard")}
        disabled={disabled}
        className="flex-1 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        aria-label="Mark as hard to recall"
      >
        <span className="text-red-600 dark:text-red-400 font-semibold">Hard</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={() => onFeedback("good")}
        disabled={disabled}
        className="flex-1 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950"
        aria-label="Mark as good recall"
      >
        <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Good</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={() => onFeedback("easy")}
        disabled={disabled}
        className="flex-1 border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
        aria-label="Mark as easy to recall"
      >
        <span className="text-green-600 dark:text-green-400 font-semibold">Easy</span>
      </Button>
    </div>
  );
}

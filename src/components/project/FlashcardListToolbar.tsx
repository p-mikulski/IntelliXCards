interface FlashcardListToolbarProps {
  flashcardCount: number;
  onCreateClick: () => void;
}

/**
 * Toolbar for the flashcard list showing count and create action
 */
export default function FlashcardListToolbar({ flashcardCount, onCreateClick }: FlashcardListToolbarProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900">Flashcards ({flashcardCount})</h2>
      <button
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        onClick={onCreateClick}
        type="button"
      >
        Create Flashcard
      </button>
    </div>
  );
}

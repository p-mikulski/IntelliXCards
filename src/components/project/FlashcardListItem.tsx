import type { FlashcardListItemDto } from "@/types";

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
    <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Front</h3>
          <p className="text-gray-900 break-words">{flashcard.front}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Back</h3>
          <p className="text-gray-900 break-words">{flashcard.back}</p>
        </div>
      </div>

      {flashcard.feedback && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Last feedback: <span className="font-medium capitalize">{flashcard.feedback}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          onClick={onEdit}
          type="button"
          aria-label={`Edit flashcard: ${flashcard.front}`}
        >
          Edit
        </button>
        <button
          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          onClick={onDelete}
          type="button"
          aria-label={`Delete flashcard: ${flashcard.front}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

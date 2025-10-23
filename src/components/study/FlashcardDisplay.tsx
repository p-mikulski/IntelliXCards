import { Card, CardContent } from "../ui/card";

interface FlashcardDisplayProps {
  front: string;
  back: string;
  isFlipped: boolean;
}

/**
 * Component that displays a flashcard with flip animation
 * Shows the front content initially, then the back content when flipped
 */
export function FlashcardDisplay({ front, back, isFlipped }: FlashcardDisplayProps) {
  return (
    <div className="perspective-1000">
      <Card
        className={`relative transition-transform duration-500 transform-style-3d min-h-[300px] ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {!isFlipped ? (
          <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
            <div className="text-center">
              <p className="text-lg font-medium">{front}</p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex items-center justify-center p-8 min-h-[300px] backface-hidden rotate-y-180">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Answer:</p>
              <p className="text-lg">{back}</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

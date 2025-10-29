import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/common/PageHeader";

interface StudySessionHeaderProps {
  currentCard: number;
  totalCards: number;
  progressPercentage: number;
  onExitClick: () => void;
}

/**
 * Study session header with progress indicator
 */
export default function StudySessionHeader({
  currentCard,
  totalCards,
  progressPercentage,
  onExitClick,
}: StudySessionHeaderProps) {
  return (
    <>
      <PageHeader title="Study Session">
        <Button variant="outline" onClick={onExitClick} size="sm" aria-label="Exit study session">
          Exit Study
        </Button>
      </PageHeader>

      {/* Progress bar section - placed below the sticky header */}
      <div className="border-b bg-background">
        <div className="container px-6 py-3 max-w-full">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Card {currentCard} of {totalCards}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} aria-label="Study progress" />
          </div>
        </div>
      </div>
    </>
  );
}

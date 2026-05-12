import type { ReactNode } from "react";

interface QuestionCardProps {
  children: ReactNode;
  questionNumber: number;
  totalQuestions: number;
  timer: number; // seconds remaining
}

export function QuestionCard({
  children,
  questionNumber,
  totalQuestions,
  timer,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Pertanyaan {questionNumber} / {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
              timer <= 5
                ? "bg-red-100 text-red-600"
                : timer <= 10
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {timer}s
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-simakin-primary transition-all duration-300"
          style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question content */}
      {children}
    </div>
  );
}
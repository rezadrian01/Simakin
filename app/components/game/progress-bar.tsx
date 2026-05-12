interface GameProgressProps {
  current: number;
  total: number;
}

export function GameProgress({ current, total }: GameProgressProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground text-center">
        Pertanyaan {current} dari {total}
      </p>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-simakin-primary transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
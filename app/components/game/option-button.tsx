import type { ReactNode } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface OptionButtonProps {
  children: ReactNode;
  onClick: () => void;
  state: "idle" | "correct" | "wrong" | "selected";
  disabled: boolean;
}

export function OptionButton({
  children,
  onClick,
  state,
  disabled,
}: OptionButtonProps) {
  const variants: Record<OptionButtonProps["state"], string> = {
    idle: "border-2 border-muted-foreground/20 bg-card hover:border-simakin-primary hover:bg-simakin-primary/10 hover:text-simakin-primary",
    selected: "border-2 border-simakin-primary bg-simakin-primary/10",
    correct: "border-2 border-green-500 bg-green-50 text-green-700",
    wrong: "border-2 border-red-500 bg-red-50 text-red-700",
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full text-left justify-start h-auto py-3 px-4 font-normal text-base transition-all whitespace-normal break-words",
        variants[state]
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
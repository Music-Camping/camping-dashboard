"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlurredCellProps {
  value: string | number;
  isBlurred: boolean;
  formatValue?: (value: string | number) => string;
  allowTemporaryReveal?: boolean;
  className?: string;
}

export function BlurredCell({
  value,
  isBlurred,
  formatValue,
  allowTemporaryReveal = true,
  className,
}: BlurredCellProps) {
  const [isTemporarilyRevealed, setIsTemporarilyRevealed] = useState(false);

  const displayValue = formatValue ? formatValue(value) : String(value);
  const shouldBlur = isBlurred && !isTemporarilyRevealed;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "transition-all duration-200",
          shouldBlur && "blur-[6px] select-none",
        )}
      >
        {displayValue}
      </span>
      {isBlurred && allowTemporaryReveal && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsTemporarilyRevealed(!isTemporarilyRevealed)}
          aria-label={isTemporarilyRevealed ? "Ocultar valor" : "Revelar valor"}
        >
          {isTemporarilyRevealed ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}

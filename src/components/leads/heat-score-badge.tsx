"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_COLORS: Record<number, string> = {
  1: "text-blue-400",
  2: "text-cyan-500",
  3: "text-yellow-500",
  4: "text-orange-500",
  5: "text-red-500",
};

const SCORE_BG: Record<number, string> = {
  1: "bg-blue-50",
  2: "bg-cyan-50",
  3: "bg-yellow-50",
  4: "bg-orange-50",
  5: "bg-red-50",
};

export function HeatScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const clampedScore = Math.max(1, Math.min(5, score));
  const iconSize = size === "md" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5",
      SCORE_BG[clampedScore]
    )}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={cn(
            iconSize,
            i < clampedScore ? SCORE_COLORS[clampedScore] : "text-muted-foreground/20"
          )}
          fill={i < clampedScore ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

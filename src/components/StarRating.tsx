"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarDisplay({ value, max = 5, size = "sm" }: { value: number; max?: number; size?: "sm" | "md" }) {
  const px = size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const starVal = i + 1;
        const full = value >= starVal;
        const half = !full && value >= starVal - 0.5;

        return (
          <div key={i} className={cn("relative", px)}>
            <Star className={cn("absolute inset-0", px, "text-zinc-300 dark:text-zinc-600")} />
            {full && (
              <Star className={cn("absolute inset-0", px, "fill-amber-400 text-amber-400")} />
            )}
            {half && (
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className={cn(px, "fill-amber-400 text-amber-400")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StarInput({
  value,
  hoverValue,
  onChange,
  onHover,
  size = "md",
}: {
  value: number;
  hoverValue: number;
  onChange: (v: number) => void;
  onHover: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-5 h-5";
  const display = hoverValue || value;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => onHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star;
        const half = !full && display >= star - 0.5;

        return (
          <div key={star} className={cn("relative cursor-pointer", px)}>
            <div
              className="absolute inset-0 w-1/2 z-10"
              onMouseEnter={() => onHover(star - 0.5)}
              onClick={() => onChange(value === star - 0.5 ? 0 : star - 0.5)}
            />
            <div
              className="absolute inset-0 left-1/2 w-1/2 z-10"
              onMouseEnter={() => onHover(star)}
              onClick={() => onChange(value === star ? 0 : star)}
            />
            <Star className={cn("absolute inset-0", px, "text-zinc-300 dark:text-zinc-600")} />
            {full && (
              <Star className={cn("absolute inset-0", px, "fill-amber-400 text-amber-400")} />
            )}
            {half && (
              <div className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className={cn(px, "fill-amber-400 text-amber-400")} />
              </div>
            )}
          </div>
        );
      })}
      <span className="ml-1 text-sm text-zinc-500 tabular-nums w-6">
        {display > 0 ? display : "—"}
      </span>
    </div>
  );
}

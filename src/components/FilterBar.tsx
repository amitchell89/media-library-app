"use client";

import { cn } from "@/lib/utils";
import { Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  genres: string[];
  mediums: string[];
  selectedGenre: string;
  selectedMedium: string;
  sortBy: string;
  onGenreChange: (genre: string) => void;
  onMediumChange: (medium: string) => void;
  onSortChange: (sort: string) => void;
}

export function FilterBar({
  genres,
  mediums,
  selectedGenre,
  selectedMedium,
  sortBy,
  onGenreChange,
  onMediumChange,
  onSortChange,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters = selectedGenre || selectedMedium;
  const activeCount = [selectedGenre, selectedMedium].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
            expanded || hasFilters
              ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400"
              : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-xs">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="title">Sort: Title</option>
          <option value="year-desc">Sort: Newest</option>
          <option value="year-asc">Sort: Oldest</option>
          <option value="tomatometer">Sort: Rating</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              onGenreChange("");
              onMediumChange("");
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Genre
            </label>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                label="All"
                active={!selectedGenre}
                onClick={() => onGenreChange("")}
              />
              {genres.map((g) => (
                <FilterPill
                  key={g}
                  label={g}
                  active={selectedGenre === g}
                  onClick={() => onGenreChange(selectedGenre === g ? "" : g)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Format
            </label>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                label="All"
                active={!selectedMedium}
                onClick={() => onMediumChange("")}
              />
              {mediums.map((m) => (
                <FilterPill
                  key={m}
                  label={m}
                  active={selectedMedium === m}
                  onClick={() => onMediumChange(selectedMedium === m ? "" : m)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        active
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
      )}
    >
      {label}
    </button>
  );
}

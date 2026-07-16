import type { DigitEntry, DigitProblem } from "@/types/game";

interface DigitProgressProps {
  problem: DigitProblem | null;
  entries: DigitEntry[];
}

/**
 * Shows what the player has typed so far for the current problem — not the
 * target digits, which stay hidden until entered. Blank slots show "_".
 */
export function DigitProgress({ problem, entries }: DigitProgressProps) {
  if (!problem) return <div className="h-14" />;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="text-xs text-slate-500">10진수 {problem.decimalValue}</div>
      <div className="flex flex-wrap justify-center gap-2">
        {problem.digits.map((_, i) => {
          const entry = entries[i];
          return (
            <span
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-lg font-bold ${
                entry === undefined
                  ? "border-slate-700 bg-slate-900 text-slate-600"
                  : entry.judgment === "correct"
                    ? "border-emerald-600 bg-emerald-950 text-emerald-400"
                    : "border-rose-600 bg-rose-950 text-rose-400"
              }`}
            >
              {entry?.digit ?? "_"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

import type { DigitEntry, DigitProblem } from "@/types/game";

interface DigitProgressProps {
  problem: DigitProblem | null;
  entries: DigitEntry[];
}

/**
 * Shows what the player has typed so far for the current problem — not the
 * target digits, which stay hidden until entered. Blank slots show "–".
 */
export function DigitProgress({ problem, entries }: DigitProgressProps) {
  if (!problem) return <div className="h-14" />;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="text-xs font-bold text-navy-text-muted">10진수 {problem.decimalValue}</div>
      <div className="flex flex-wrap justify-center gap-2">
        {problem.digits.map((_, i) => {
          const entry = entries[i];
          return (
            <span
              key={i}
              className={`flex h-14 w-11 items-center justify-center rounded-xl font-mono text-[22px] font-extrabold ${
                entry === undefined
                  ? "bg-navy-deep text-navy-text-faint"
                  : entry.judgment === "correct"
                    ? "bg-coral text-white shadow-[0_4px_0_var(--color-coral-dark)]"
                    : "border-2 border-rose-600 bg-rose-950 text-rose-400"
              }`}
            >
              {entry?.digit ?? "–"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

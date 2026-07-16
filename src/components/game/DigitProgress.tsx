import type { DigitProblem } from "@/types/game";

export function DigitProgress({ problem, digitIndex }: { problem: DigitProblem | null; digitIndex: number }) {
  if (!problem) return <div className="h-14" />;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="text-xs text-slate-500">10진수 {problem.decimalValue}</div>
      <div className="flex gap-2">
        {problem.digits.map((digit, i) => (
          <span
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-lg font-bold ${
              i < digitIndex
                ? "border-emerald-600 bg-emerald-950 text-emerald-400"
                : i === digitIndex
                  ? "border-orange-500 bg-orange-950 text-orange-300"
                  : "border-slate-700 bg-slate-900 text-slate-500"
            }`}
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}

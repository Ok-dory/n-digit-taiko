import type { Base, DigitProblem } from "@/types/game";

const DIGIT_SYMBOLS = "0123456789ABCDEF";

interface PlaceValueHelperProps {
  base: Base;
  problem: DigitProblem | null;
  digitIndex: number;
  variant: "side" | "inline";
  className?: string;
}

/**
 * Shows, for the digit slot currently being entered, what decimal value
 * each candidate digit would contribute at that place — e.g. in a 3-base
 * number's first slot, pressing "1" contributes 81, "2" contributes 162.
 * Never reveals which digit is correct, only the place-value arithmetic;
 * re-renders for the next slot as soon as one is entered.
 */
export function PlaceValueHelper({ base, problem, digitIndex, variant, className = "" }: PlaceValueHelperProps) {
  if (!problem || digitIndex >= problem.digits.length) return null;

  const remainingDigits = problem.digits.length - 1 - digitIndex;
  const placeValue = base ** remainingDigits;
  const symbols = DIGIT_SYMBOLS.slice(0, base).split("");

  if (variant === "side") {
    return (
      <div className={`w-40 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 ${className}`}>
        <div className="mb-2 text-center text-xs text-slate-500">
          이 자리 값
          <br />
          <span className="font-mono text-orange-400">×{placeValue.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1">
          {symbols.map((symbol, digit) => (
            <div
              key={symbol}
              className="flex items-center justify-between rounded-lg bg-slate-800/60 px-2 py-1 font-mono text-sm"
            >
              <span className="text-orange-400">{symbol}</span>
              <span className="text-slate-300">{(digit * placeValue).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto px-4 pb-2 ${className}`}>
      <span className="shrink-0 text-xs text-slate-500">
        ×{placeValue.toLocaleString()}
      </span>
      {symbols.map((symbol, digit) => (
        <div
          key={symbol}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800/60 px-2 py-1 font-mono text-sm"
        >
          <span className="text-orange-400">{symbol}</span>
          <span className="text-slate-300">{(digit * placeValue).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

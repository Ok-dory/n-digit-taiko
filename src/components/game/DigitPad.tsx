"use client";

import { useKeyBindings } from "@/hooks/useKeyBindings";
import type { Base } from "@/types/game";

const DIGIT_SYMBOLS = "0123456789ABCDEF".split("");

function keyLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

interface DigitPadProps {
  base: Base;
  onPress: (symbol: string) => void;
}

/** On-screen buttons mirroring the current base's keys — mouse/touch friendly. */
export function DigitPad({ base, onPress }: DigitPadProps) {
  const { bindings } = useKeyBindings();
  const symbols = DIGIT_SYMBOLS.slice(0, base);

  return (
    <div className="grid grid-cols-4 gap-2 px-4 pb-4 sm:grid-cols-8">
      {symbols.map((symbol) => (
        <button
          key={symbol}
          onPointerDown={(e) => {
            e.preventDefault();
            onPress(symbol);
          }}
          className="flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900/80 py-3 transition-colors active:bg-orange-500"
        >
          <span className="font-mono text-xl font-bold text-slate-100">{symbol}</span>
          <span className="text-[10px] text-slate-500">{keyLabel(bindings[symbol] ?? "")}</span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { useKeyBindings } from "@/hooks/useKeyBindings";
import { DIGIT_PALETTE } from "@/components/digitPalette";
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
    <div className="grid grid-cols-4 gap-2.5 px-4 pb-5 sm:grid-cols-8">
      {symbols.map((symbol, i) => {
        const palette = DIGIT_PALETTE[i % DIGIT_PALETTE.length];
        return (
          <button
            key={symbol}
            onPointerDown={(e) => {
              e.preventDefault();
              onPress(symbol);
            }}
            style={{ background: palette.grad, boxShadow: `0 5px 0 ${palette.shadow}` }}
            className="flex flex-col items-center gap-1 rounded-2xl py-4 transition-transform active:translate-y-[3px] active:shadow-none"
          >
            <span className={`font-mono text-[26px] font-extrabold ${palette.text}`}>{symbol}</span>
            <span className={`text-[11px] font-bold ${palette.textMuted}`}>{keyLabel(bindings[symbol] ?? "")}</span>
          </button>
        );
      })}
    </div>
  );
}

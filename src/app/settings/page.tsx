"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useKeyBindings } from "@/hooks/useKeyBindings";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { DIGIT_PALETTE } from "@/components/digitPalette";

const DIGIT_SYMBOLS = "0123456789ABCDEF".split("");

function keyLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

export default function SettingsPage() {
  const { bindings, setBinding, reset } = useKeyBindings();
  const isTouch = useIsTouchDevice();
  const [listeningFor, setListeningFor] = useState<string | null>(null);

  useEffect(() => {
    if (!listeningFor) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      setBinding(listeningFor, e.code);
      setListeningFor(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [listeningFor, setBinding]);

  if (isTouch) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="font-bold text-ink-muted">모바일에서는 화면의 숫자 버튼으로 플레이하므로 키 설정이 필요하지 않습니다.</p>
        <Link href="/" className="font-display font-bold text-coral">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[440px] overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] lg:max-w-2xl">
        <div className="flex items-center justify-between bg-coral px-6 py-5 text-white">
          <Link href="/" className="font-bold">
            ‹
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">키 설정</h1>
          <button onClick={reset} className="text-xs font-bold opacity-85">
            초기화
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="mb-4 text-center text-[13px] font-bold text-ink-muted">
            각 숫자에 원하는 키를 자유롭게 지정하세요. &quot;변경&quot;을 누른 뒤 원하는 키를 누르면 저장됩니다.
          </p>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {DIGIT_SYMBOLS.map((symbol, i) => {
              const palette = DIGIT_PALETTE[i % DIGIT_PALETTE.length];
              return (
                <div key={symbol} className="flex items-center gap-2 rounded-2xl bg-cream-soft px-3 py-2.5">
                  <div
                    className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-extrabold ${palette.text}`}
                    style={{ background: palette.solid }}
                  >
                    {symbol}
                  </div>
                  <div className="flex-1 truncate font-mono text-xs font-bold text-ink">
                    {keyLabel(bindings[symbol] ?? "-")}
                  </div>
                  <button
                    onClick={() => setListeningFor(symbol)}
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                      listeningFor === symbol ? "bg-coral text-white" : "bg-cream-border/60 text-ink-muted"
                    }`}
                  >
                    {listeningFor === symbol ? "키를 누르세요..." : "변경"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

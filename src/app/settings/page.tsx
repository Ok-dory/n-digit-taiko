"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useKeyBindings } from "@/hooks/useKeyBindings";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="text-slate-400">
          모바일에서는 화면의 숫자 버튼으로 플레이하므로 키 설정이 필요하지 않습니다.
        </p>
        <Link href="/" className="text-orange-400 hover:text-orange-300">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">키 설정</h1>
        <button onClick={reset} className="text-sm text-slate-500 hover:text-orange-400">
          초기화
        </button>
      </div>

      <p className="text-sm text-slate-400">
        각 숫자에 원하는 키를 자유롭게 지정하세요. &quot;변경&quot;을 누른 뒤 원하는 키를 누르면 저장됩니다.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DIGIT_SYMBOLS.map((symbol) => (
          <div
            key={symbol}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
          >
            <span className="font-mono text-lg font-bold text-orange-400">{symbol}</span>
            <span className="font-mono text-slate-300">{keyLabel(bindings[symbol] ?? "-")}</span>
            <button
              onClick={() => setListeningFor(symbol)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                listeningFor === symbol
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {listeningFor === symbol ? "키를 누르세요..." : "변경"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

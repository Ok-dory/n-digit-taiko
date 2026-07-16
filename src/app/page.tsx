"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Base } from "@/types/game";
import { SettingsManager } from "@/game/SettingsManager";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [base, setBase] = useState<Base>(2);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(SettingsManager.loadPlayerName());
  }, []);

  const startGame = () => {
    if (!name.trim()) return;
    SettingsManager.savePlayerName(name.trim());
    const params = new URLSearchParams({ base: String(base), name: name.trim() });
    router.push(`/play?${params.toString()}`);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">N진수 태고</h1>
        <p className="mt-2 text-slate-400">숫자가 나오면 그 진법 조합을 30초 안에 최대한 빠르고 정확하게 완성하세요.</p>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-400">이름</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startGame()}
            placeholder="이름을 입력하세요"
            maxLength={20}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-400">진법: {base}진수</h2>
          <input
            type="range"
            min={2}
            max={16}
            value={base}
            onChange={(e) => setBase(Number(e.target.value) as Base)}
            className="w-full accent-orange-500"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>2</span>
            <span>16</span>
          </div>
        </section>

        <button
          onClick={startGame}
          disabled={!name.trim()}
          className="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          게임 시작
        </button>
      </div>

      <nav className="flex gap-6 text-sm text-slate-400">
        <Link href="/learn" className="hover:text-orange-400">
          진법 학습 모드
        </Link>
        <Link href="/ranking" className="hover:text-orange-400">
          랭킹
        </Link>
        <Link href="/stats" className="hover:text-orange-400">
          통계
        </Link>
        <Link href="/settings" className="hover:text-orange-400">
          키 설정
        </Link>
      </nav>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { Base, Difficulty, GameMode, TimeAttackDuration } from "@/types/game";
import { configToSearchParams } from "@/utils/gameConfig";

const MODES: { value: GameMode; label: string }[] = [
  { value: "practice", label: "Practice (무제한)" },
  { value: "timeAttack", label: "Time Attack" },
  { value: "endless", label: "Endless" },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "insane", label: "Insane" },
];

const DURATIONS: TimeAttackDuration[] = [30, 60, 90, 120];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode>("practice");
  const [base, setBase] = useState<Base>(2);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [duration, setDuration] = useState<TimeAttackDuration>(30);

  const startGame = () => {
    const params = configToSearchParams(
      mode === "timeAttack" ? { mode, base, difficulty, duration } : { mode, base, difficulty }
    );
    router.push(`/play?${params.toString()}`);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">N진수 태고</h1>
        <p className="mt-2 text-slate-400">숫자가 나오면 그 진법 조합을 최대한 빠르고 정확하게 완성하세요.</p>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-400">모드</h2>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  mode === m.value ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        {mode === "timeAttack" && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-400">제한시간</h2>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    duration === d ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {d}초
                </button>
              ))}
            </div>
          </section>
        )}

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

        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-400">난이도</h2>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  difficulty === d.value ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={startGame}
          className="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white transition-colors hover:bg-orange-400"
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

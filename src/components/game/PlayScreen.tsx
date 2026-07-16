"use client";

import Link from "next/link";
import { useGameEngine } from "@/hooks/useGameEngine";
import { HUD } from "@/components/game/HUD";
import { DigitProgress } from "@/components/game/DigitProgress";
import { JudgmentFlash } from "@/components/game/JudgmentFlash";
import { GameOverOverlay } from "@/components/game/GameOverOverlay";
import type { GameConfig } from "@/types/game";

export function PlayScreen({ config }: { config: GameConfig }) {
  const {
    canvasRef,
    scoreState,
    problem,
    digitIndex,
    lastJudgment,
    secondsRemaining,
    elapsedSeconds,
    isGameOver,
    endSession,
  } = useGameEngine(config);
  const canEndManually = config.mode === "practice" || config.mode === "endless";

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-3">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <span className="text-xs text-slate-500">
          {config.mode} · {config.difficulty}
        </span>
        {canEndManually && !isGameOver && (
          <button onClick={endSession} className="text-sm text-slate-500 hover:text-orange-400">
            종료
          </button>
        )}
      </div>

      <HUD scoreState={scoreState} base={config.base} secondsRemaining={secondsRemaining} elapsedSeconds={elapsedSeconds} />
      <DigitProgress problem={problem} digitIndex={digitIndex} />

      <div className="relative mx-4 mb-4 flex-1 overflow-hidden rounded-2xl border border-slate-800">
        <canvas ref={canvasRef} className="h-full w-full" />
        <JudgmentFlash event={lastJudgment} />
        {isGameOver && <GameOverOverlay scoreState={scoreState} base={config.base} difficulty={config.difficulty} />}
      </div>
    </main>
  );
}

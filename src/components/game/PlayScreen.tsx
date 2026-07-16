"use client";

import Link from "next/link";
import { useGameEngine } from "@/hooks/useGameEngine";
import { HUD } from "@/components/game/HUD";
import { DigitProgress } from "@/components/game/DigitProgress";
import { DigitPad } from "@/components/game/DigitPad";
import { BonusFlash } from "@/components/game/BonusFlash";
import { GameOverOverlay } from "@/components/game/GameOverOverlay";
import type { GameConfig } from "@/types/game";

export function PlayScreen({ config }: { config: GameConfig }) {
  const {
    scoreState,
    problem,
    entries,
    lastBonus,
    secondsRemaining,
    elapsedSeconds,
    hps,
    bonusActive,
    isGameOver,
    pressDigit,
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

      <HUD
        scoreState={scoreState}
        base={config.base}
        secondsRemaining={secondsRemaining}
        elapsedSeconds={elapsedSeconds}
        hps={hps}
        bonusActive={bonusActive}
      />

      <div className="relative mx-4 mb-4 flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          {problem && (
            <div className="font-mono text-6xl font-extrabold text-slate-100 sm:text-7xl">
              {problem.decimalValue}
            </div>
          )}
          <DigitProgress problem={problem} entries={entries} />
        </div>

        <DigitPad base={config.base} onPress={pressDigit} />

        <BonusFlash bonus={lastBonus} />
        {isGameOver && (
          <GameOverOverlay scoreState={scoreState} base={config.base} difficulty={config.difficulty} hps={hps} />
        )}
      </div>
    </main>
  );
}

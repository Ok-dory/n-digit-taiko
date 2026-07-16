"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGameEngine } from "@/hooks/useGameEngine";
import { RankingManager } from "@/game/RankingManager";
import { HUD } from "@/components/game/HUD";
import { DigitProgress } from "@/components/game/DigitProgress";
import { DigitPad } from "@/components/game/DigitPad";
import { PlaceValueHelper } from "@/components/game/PlaceValueHelper";
import { BonusFlash } from "@/components/game/BonusFlash";
import { CountdownOverlay } from "@/components/game/CountdownOverlay";
import { GameOverOverlay } from "@/components/game/GameOverOverlay";
import type { Base } from "@/types/game";

const SUMMARY_DURATION_MS = 3000;

type Phase = "countdown" | "play";

export function PlayScreen({ base, playerName }: { base: Base; playerName: string }) {
  const [phase, setPhase] = useState<Phase>("countdown");

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-3">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <span className="text-xs text-slate-500">{playerName}</span>
      </div>

      <div className="relative mx-4 mb-4 flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
        {phase === "countdown" && <CountdownOverlay onDone={() => setPhase("play")} />}
        {phase === "play" && <ActiveGame base={base} playerName={playerName} />}
      </div>
    </main>
  );
}

function ActiveGame({ base, playerName }: { base: Base; playerName: string }) {
  const {
    scoreState,
    problem,
    digitIndex,
    entries,
    lastBonus,
    secondsRemaining,
    hps,
    bonusActive,
    isGameOver,
    pressDigit,
  } = useGameEngine(base);

  const [showRanking, setShowRanking] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (!isGameOver || submitted.current) return;
    submitted.current = true;
    RankingManager.submitScore({
      player_name: playerName,
      score: scoreState.score,
      accuracy: scoreState.accuracy,
      combo: scoreState.maxCombo,
      hps,
      base,
    });
    const timer = setTimeout(() => setShowRanking(true), SUMMARY_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  return (
    <>
      <HUD
        scoreState={scoreState}
        base={base}
        secondsRemaining={secondsRemaining}
        hps={hps}
        bonusActive={bonusActive}
      />

      <div className="flex flex-1 flex-col lg:flex-row lg:gap-4 lg:px-4">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            {problem && (
              <div className="font-mono text-6xl font-extrabold text-slate-100 sm:text-7xl">
                {problem.decimalValue}
              </div>
            )}
            <DigitProgress problem={problem} entries={entries} />
          </div>

          <PlaceValueHelper
            base={base}
            problem={problem}
            digitIndex={digitIndex}
            variant="inline"
            className="lg:hidden"
          />

          <DigitPad base={base} onPress={pressDigit} />
        </div>

        <PlaceValueHelper
          base={base}
          problem={problem}
          digitIndex={digitIndex}
          variant="side"
          className="hidden lg:block lg:my-4"
        />
      </div>

      <BonusFlash bonus={lastBonus} />
      {isGameOver && (
        <GameOverOverlay
          stage={showRanking ? "ranking" : "summary"}
          scoreState={scoreState}
          base={base}
          hps={hps}
        />
      )}
    </>
  );
}

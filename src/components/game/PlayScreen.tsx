"use client";

import { useEffect, useRef, useState } from "react";
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
    <main className="flex flex-1 items-center justify-center px-0 py-4 sm:px-4 sm:py-6">
      <div className="relative flex min-h-[640px] w-full flex-1 flex-col overflow-hidden rounded-[40px] bg-navy shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] sm:max-w-[420px] lg:max-w-4xl lg:min-h-[75vh]">
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

      <div className="flex flex-1 flex-col">
        <div
          className="relative mx-5 mt-4 flex flex-1 items-center justify-center gap-6 overflow-hidden rounded-3xl"
          style={{ background: "radial-gradient(circle at 50% 30%, oklch(28% 0.03 260), oklch(20% 0.025 260))" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, oklch(100% 0 0 / .03) 0 16px, transparent 16px 32px)",
            }}
          />

          <div className="relative flex flex-col items-center gap-4">
            {problem && (
              <div
                className="font-mono text-6xl font-extrabold text-white sm:text-7xl lg:text-8xl"
                style={{ textShadow: "0 4px 0 oklch(0% 0 0 / .3)" }}
              >
                {problem.decimalValue}
              </div>
            )}
            <DigitProgress problem={problem} entries={entries} />
          </div>

          <PlaceValueHelper
            base={base}
            problem={problem}
            digitIndex={digitIndex}
            variant="side"
            className="relative hidden lg:block lg:w-48"
          />
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

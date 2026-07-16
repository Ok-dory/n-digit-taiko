"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameEngine, TOTAL_TIME_SECONDS, type BonusEvent } from "@/game/GameEngine";
import type { Base, DigitEntry, DigitProblem, JudgmentEvent, ScoreState } from "@/types/game";

export interface UseGameEngineResult {
  scoreState: ScoreState;
  problem: DigitProblem | null;
  digitIndex: number;
  entries: DigitEntry[];
  lastJudgment: JudgmentEvent | null;
  lastBonus: BonusEvent | null;
  secondsRemaining: number;
  elapsedSeconds: number;
  hps: number;
  bonusActive: boolean;
  isGameOver: boolean;
  pressDigit: (symbol: string) => void;
}

/** Wires a GameEngine instance to React state so components stay UI-only. */
export function useGameEngine(base: Base): UseGameEngineResult {
  const engineRef = useRef<GameEngine | null>(null);

  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    totalCount: 0,
    accuracy: 100,
  });
  const [problem, setProblem] = useState<DigitProblem | null>(null);
  const [digitIndex, setDigitIndex] = useState(0);
  const [entries, setEntries] = useState<DigitEntry[]>([]);
  const [lastJudgment, setLastJudgment] = useState<JudgmentEvent | null>(null);
  const [lastBonus, setLastBonus] = useState<BonusEvent | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_TIME_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hps, setHps] = useState(0);
  const [bonusActive, setBonusActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const engine = new GameEngine(base, {
      onScoreChange: setScoreState,
      onProblemChange: (p, idx, newEntries) => {
        setProblem(p);
        setDigitIndex(idx);
        setEntries([...newEntries]);
      },
      onJudgment: setLastJudgment,
      onBonus: setLastBonus,
      onTick: (remaining, elapsed, currentHps, currentBonusActive) => {
        setSecondsRemaining(remaining);
        setElapsedSeconds(elapsed);
        setHps(currentHps);
        setBonusActive(currentBonusActive);
      },
      onGameOver: () => setIsGameOver(true),
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [base]);

  const pressDigit = useMemo(() => (symbol: string) => engineRef.current?.manualInput(symbol), []);

  return {
    scoreState,
    problem,
    digitIndex,
    entries,
    lastJudgment,
    lastBonus,
    secondsRemaining,
    elapsedSeconds,
    hps,
    bonusActive,
    isGameOver,
    pressDigit,
  };
}

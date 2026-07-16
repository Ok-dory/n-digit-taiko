"use client";

import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/game/GameEngine";
import type { DigitProblem, GameConfig, JudgmentEvent, ScoreState } from "@/types/game";

export interface UseGameEngineResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scoreState: ScoreState;
  problem: DigitProblem | null;
  digitIndex: number;
  lastJudgment: JudgmentEvent | null;
  secondsRemaining: number | null;
  elapsedSeconds: number;
  isGameOver: boolean;
  endSession: () => void;
}

/** Wires a GameEngine instance to React state so components stay UI-only. */
export function useGameEngine(config: GameConfig): UseGameEngineResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    totalCount: 0,
    accuracy: 100,
  });
  const [problem, setProblem] = useState<DigitProblem | null>(null);
  const [digitIndex, setDigitIndex] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<JudgmentEvent | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    config.mode === "timeAttack" ? (config.duration ?? 60) : null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const engine = new GameEngine(canvas, config, {
      onScoreChange: setScoreState,
      onProblemChange: (p, idx) => {
        setProblem(p);
        setDigitIndex(idx);
      },
      onJudgment: setLastJudgment,
      onTick: (remaining, elapsed) => {
        setSecondsRemaining(remaining);
        setElapsedSeconds(elapsed);
      },
      onGameOver: () => setIsGameOver(true),
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      window.removeEventListener("resize", resize);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode, config.base, config.difficulty, config.duration]);

  const endSession = () => engineRef.current?.finish();

  return {
    canvasRef,
    scoreState,
    problem,
    digitIndex,
    lastJudgment,
    secondsRemaining,
    elapsedSeconds,
    isGameOver,
    endSession,
  };
}

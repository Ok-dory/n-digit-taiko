"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import { Mascot } from "@/components/Mascot";
import type { Base, RankingBoard, ScoreState } from "@/types/game";

interface GameOverOverlayProps {
  stage: "summary" | "ranking";
  scoreState: ScoreState;
  base: Base;
  hps: number;
}

/**
 * Mirrors the original arcade flow: show the final score for a few
 * seconds (stage "summary"), then automatically switch to the weekly
 * ranking board (stage "ranking") — no submit button, no waiting. Both
 * stages also offer manual buttons so an impatient player can skip ahead.
 */
export function GameOverOverlay({ stage, scoreState, base, hps }: GameOverOverlayProps) {
  const router = useRouter();

  return (
    <div
      className="absolute inset-0 flex flex-col items-center overflow-y-auto pt-8 pb-6"
      style={{ background: "radial-gradient(circle at 50% 0%, oklch(60% 0.19 25), oklch(20% 0.03 260) 55%)" }}
    >
      <div className="pointer-events-none absolute top-[70px] left-9 h-3.5 w-3.5 animate-bob rounded-sm bg-gold [--r:20deg]" />
      <div
        className="pointer-events-none absolute top-[108px] right-11 h-2.5 w-2.5 animate-bob rounded-full bg-teal"
        style={{ animationDelay: ".3s" }}
      />
      <div
        className="pointer-events-none absolute top-[172px] left-14 h-3 w-3 animate-bob rounded-sm bg-white [--r:-15deg]"
        style={{ animationDelay: ".5s" }}
      />
      <div
        className="pointer-events-none absolute top-[46px] right-[76px] h-2.5 w-2.5 animate-bob rounded-full bg-gold"
        style={{ animationDelay: ".2s" }}
      />

      <Mascot scale={0.75} className="relative" />
      <div className="mt-1 font-display text-[15px] font-extrabold tracking-wide text-white">라운드 종료!</div>

      <div className="relative mt-4 w-[86%] max-w-[326px] rounded-3xl bg-cream-card px-6 py-6">
        <div className="text-center">
          <div className="text-xs font-bold text-ink-muted">최종 점수</div>
          <div className="font-mono text-[44px] font-extrabold text-coral">{scoreState.score.toLocaleString()}</div>
        </div>
        <div className="mt-4 flex gap-2.5">
          <MiniStat label="정확도" value={`${scoreState.accuracy}%`} />
          <MiniStat label="최대 콤보" value={`${scoreState.maxCombo}`} />
          <MiniStat label="HPS" value={hps.toFixed(1)} />
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-4 w-full rounded-2xl py-3.5 font-display text-base font-extrabold text-white shadow-[0_5px_0_var(--color-coral-shadow)] transition-transform active:translate-y-0.5 active:shadow-none"
          style={{ background: "linear-gradient(180deg, var(--color-coral-strong), var(--color-coral-dark))" }}
        >
          다시 시작
        </button>
        <Link
          href="/ranking"
          className="mt-2.5 block w-full rounded-2xl border-2 border-cream-border py-3 text-center font-display text-[15px] font-bold text-ink"
        >
          랭킹 전체 보기
        </Link>
      </div>

      {stage === "ranking" && <RankingStage base={base} />}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-cream-softer py-2.5 text-center">
      <div className="text-[10px] font-bold text-ink-muted">{label}</div>
      <div className="font-mono text-base font-extrabold text-ink">{value}</div>
    </div>
  );
}

function RankingStage({ base }: { base: Base }) {
  const [board, setBoard] = useState<RankingBoard | null>(null);

  useEffect(() => {
    RankingManager.getBoard(base, 10).then(setBoard);
  }, [base]);

  const rows = board
    ? [
        ...(board.allTimeBest ? [{ ...board.allTimeBest, isAllTime: true }] : []),
        ...board.weekly.map((e) => ({ ...e, isAllTime: false })),
      ]
    : [];

  return (
    <div className="relative mt-4 w-[86%] max-w-[326px] rounded-3xl bg-cream-card px-6 py-6 text-center">
      <h2 className="font-display text-lg font-extrabold text-coral">-- RANKING ({base}진수) --</h2>

      {board === null && <p className="mt-3 text-sm font-bold text-ink-muted">불러오는 중...</p>}

      {board !== null && rows.length === 0 && (
        <p className="mt-3 text-sm font-bold text-ink-muted">아직 기록이 없습니다. 첫 기록의 주인공이 되어보세요!</p>
      )}

      {board !== null && rows.length > 0 && (
        <ol className="mt-3 space-y-1.5 text-left text-sm">
          {rows.map((entry, i) => (
            <li
              key={entry.id ?? i}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono font-bold ${
                entry.isAllTime ? "bg-gold/40" : "bg-cream-softer"
              }`}
            >
              <span className="text-coral">{entry.isAllTime ? "🏆" : `${i + 1}.`}</span>
              <span className="flex-1 truncate text-left font-sans text-ink">{entry.player_name}</span>
              <span className="text-ink">{entry.score.toLocaleString()}점</span>
              <span className="text-ink-muted">{entry.accuracy}%</span>
              <span className="text-ink-muted">HPS {entry.hps?.toFixed(1) ?? "-"}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

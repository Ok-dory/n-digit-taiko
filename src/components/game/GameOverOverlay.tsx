"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
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
 * ranking board (stage "ranking") — no submit button, no waiting.
 */
export function GameOverOverlay({ stage, scoreState, base, hps }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90">
      {stage === "summary" ? (
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <h2 className="text-2xl font-bold text-rose-400">GAME OVER</h2>
          <div className="grid grid-cols-2 gap-3 text-left text-sm">
            <Row label="점수" value={scoreState.score.toLocaleString()} />
            <Row label="정확도" value={`${scoreState.accuracy}%`} />
            <Row label="최대 콤보" value={`${scoreState.maxCombo}`} />
            <Row label="HPS" value={hps.toFixed(2)} />
          </div>
        </div>
      ) : (
        <RankingStage base={base} />
      )}
    </div>
  );
}

function RankingStage({ base }: { base: Base }) {
  const router = useRouter();
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
    <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
      <h2 className="text-xl font-bold text-orange-400">-- RANKING ({base}진수) --</h2>

      {board === null && <p className="text-sm text-slate-500">불러오는 중...</p>}

      {board !== null && rows.length === 0 && (
        <p className="text-sm text-slate-500">아직 기록이 없습니다. 첫 기록의 주인공이 되어보세요!</p>
      )}

      {board !== null && rows.length > 0 && (
        <ol className="space-y-1 text-left text-sm">
          {rows.map((entry, i) => (
            <li
              key={entry.id ?? i}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 font-mono ${
                entry.isAllTime ? "bg-orange-500/10" : "bg-slate-800/60"
              }`}
            >
              <span className="text-orange-400">{entry.isAllTime ? "🏆" : `${i + 1}.`}</span>
              <span className="flex-1 truncate text-left">{entry.player_name}</span>
              <span>{entry.score.toLocaleString()}점</span>
              <span className="text-slate-400">{entry.accuracy}%</span>
              <span className="text-slate-400">HPS {entry.hps?.toFixed(1) ?? "-"}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex justify-center gap-4 pt-2 text-sm">
        <button onClick={() => router.push("/")} className="text-orange-400 hover:text-orange-300">
          다시 시작
        </button>
        <Link href={`/ranking`} className="text-slate-400 hover:text-orange-400">
          전체 랭킹 보기
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800/60 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-mono font-bold">{value}</div>
    </div>
  );
}

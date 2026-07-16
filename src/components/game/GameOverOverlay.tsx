"use client";

import { useState } from "react";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import { SettingsManager } from "@/game/SettingsManager";
import type { Base, Difficulty, ScoreState } from "@/types/game";

interface GameOverOverlayProps {
  scoreState: ScoreState;
  base: Base;
  difficulty: Difficulty;
  hps: number;
}

export function GameOverOverlay({ scoreState, base, difficulty, hps }: GameOverOverlayProps) {
  const [name, setName] = useState(SettingsManager.loadPlayerName());
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const submit = async () => {
    if (!name.trim()) return;
    setStatus("submitting");
    SettingsManager.savePlayerName(name.trim());
    const { error } = await RankingManager.submitScore({
      player_name: name.trim(),
      score: scoreState.score,
      accuracy: scoreState.accuracy,
      combo: scoreState.maxCombo,
      hps,
      base,
      difficulty,
    });
    setStatus(error ? "error" : "done");
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h2 className="text-2xl font-bold text-orange-400">게임 종료</h2>
        <div className="grid grid-cols-2 gap-3 text-left text-sm">
          <Row label="점수" value={scoreState.score.toLocaleString()} />
          <Row label="정확도" value={`${scoreState.accuracy}%`} />
          <Row label="최대 콤보" value={`${scoreState.maxCombo}`} />
          <Row label="HPS" value={hps.toFixed(2)} />
        </div>

        {status !== "done" ? (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="플레이어 이름"
              maxLength={20}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <button
              onClick={submit}
              disabled={status === "submitting" || !name.trim()}
              className="w-full rounded-lg bg-orange-500 py-2 font-semibold text-white transition-colors hover:bg-orange-400 disabled:opacity-50"
            >
              {status === "submitting" ? "제출 중..." : status === "error" ? "다시 시도" : "랭킹에 등록"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-emerald-400">랭킹에 등록되었습니다!</p>
        )}

        <div className="flex justify-center gap-4 pt-2 text-sm">
          <Link href="/" className="text-slate-400 hover:text-orange-400">
            홈으로
          </Link>
          <Link href="/ranking" className="text-slate-400 hover:text-orange-400">
            랭킹 보기
          </Link>
        </div>
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

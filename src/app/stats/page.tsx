"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import { SettingsManager } from "@/game/SettingsManager";
import type { PlayerStats } from "@/types/game";

export default function StatsPage() {
  const [playerName, setPlayerName] = useState("");
  const [stats, setStats] = useState<PlayerStats | null | undefined>(undefined);

  useEffect(() => {
    // One-time hydration from localStorage after mount (SSR has no window).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerName(SettingsManager.loadPlayerName());
  }, []);

  useEffect(() => {
    if (!playerName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStats(null);
      return;
    }
    RankingManager.getPlayerStats(playerName).then(setStats);
  }, [playerName]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">내 통계</h1>
        <div className="w-10" />
      </div>

      {!playerName && (
        <p className="text-center text-slate-500">
          아직 랭킹에 점수를 제출한 적이 없습니다. 게임을 플레이하고 이름을 등록해보세요.
        </p>
      )}

      {playerName && stats === undefined && <p className="text-center text-slate-500">불러오는 중...</p>}

      {playerName && stats === null && (
        <p className="text-center text-slate-500">{playerName}님의 기록이 아직 없습니다.</p>
      )}

      {playerName && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="평균 정확도" value={`${stats.averageAccuracy.toFixed(1)}%`} />
          <StatCard label="최고 점수" value={stats.bestScore.toLocaleString()} />
          <StatCard label="총 플레이 횟수" value={`${stats.totalPlays}`} />
          <StatCard label="평균 콤보" value={stats.averageCombo.toFixed(1)} />
          <StatCard label="평균 HPS" value={stats.averageHps.toFixed(2)} />
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-orange-400">{value}</div>
    </div>
  );
}

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
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[40px] bg-cream-card shadow-[0_30px_60px_-20px_oklch(30%_0.02_60_/_0.35)] lg:max-w-3xl">
        <div className="flex items-center justify-between bg-gold px-6 py-5 text-gold-ink">
          <Link href="/" className="font-bold">
            ‹
          </Link>
          <h1 className="font-display text-[17px] font-extrabold">내 통계</h1>
          <div className="w-4" />
        </div>

        <div className="px-6 py-6">
          {!playerName && (
            <p className="text-center text-sm font-bold text-ink-muted">
              아직 랭킹에 점수를 제출한 적이 없습니다. 게임을 플레이하고 이름을 등록해보세요.
            </p>
          )}

          {playerName && stats === undefined && (
            <p className="text-center text-sm font-bold text-ink-muted">불러오는 중...</p>
          )}

          {playerName && stats === null && (
            <p className="text-center text-sm font-bold text-ink-muted">{playerName}님의 기록이 아직 없습니다.</p>
          )}

          {playerName && stats && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="평균 정확도" value={`${stats.averageAccuracy.toFixed(1)}%`} />
              <StatCard label="최고 점수" value={stats.bestScore.toLocaleString()} />
              <StatCard label="총 플레이 횟수" value={`${stats.totalPlays}`} />
              <StatCard label="평균 콤보" value={stats.averageCombo.toFixed(1)} />
              <StatCard label="평균 HPS" value={stats.averageHps.toFixed(2)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream-soft p-4 text-center">
      <div className="text-xs font-bold text-ink-muted">{label}</div>
      <div className="mt-1 font-mono text-2xl font-extrabold text-coral">{value}</div>
    </div>
  );
}

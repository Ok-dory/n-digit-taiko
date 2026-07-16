"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import type { RankingEntry } from "@/types/game";

export default function RankingPage() {
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);

  useEffect(() => {
    RankingManager.getWeeklyTop(20).then(setEntries);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">주간 랭킹 (최근 7일)</h1>
        <div className="w-10" />
      </div>

      {entries === null && <p className="text-center text-slate-500">불러오는 중...</p>}

      {entries !== null && entries.length === 0 && (
        <p className="text-center text-slate-500">
          아직 기록이 없습니다. Supabase가 설정되지 않았다면 .env.local에 환경변수를 추가하세요.
        </p>
      )}

      {entries !== null && entries.length > 0 && (
        <table className="w-full overflow-hidden rounded-xl border border-slate-800 text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">순위</th>
              <th className="px-3 py-2 text-left">이름</th>
              <th className="px-3 py-2 text-right">점수</th>
              <th className="px-3 py-2 text-right">정확도</th>
              <th className="px-3 py-2 text-right">최대콤보</th>
              <th className="px-3 py-2 text-right">HPS</th>
              <th className="px-3 py-2 text-right">날짜</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.id ?? i} className="border-t border-slate-800">
                <td className="px-3 py-2 font-mono text-orange-400">{i + 1}</td>
                <td className="px-3 py-2">{entry.player_name}</td>
                <td className="px-3 py-2 text-right font-mono">{entry.score.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-mono">{entry.accuracy}%</td>
                <td className="px-3 py-2 text-right font-mono">{entry.combo}</td>
                <td className="px-3 py-2 text-right font-mono">{entry.hps?.toFixed(1) ?? "-"}</td>
                <td className="px-3 py-2 text-right text-slate-500">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

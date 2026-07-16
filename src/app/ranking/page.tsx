"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankingManager } from "@/game/RankingManager";
import type { Base, RankingBoard } from "@/types/game";

const BASES: Base[] = Array.from({ length: 15 }, (_, i) => (i + 2) as Base);

export default function RankingPage() {
  const [base, setBase] = useState<Base>(2);
  const [board, setBoard] = useState<RankingBoard | null>(null);

  useEffect(() => {
    // Reset to the loading state whenever the selected base changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(null);
    RankingManager.getBoard(base, 20).then(setBoard);
  }, [base]);

  const rows = board
    ? [
        ...(board.allTimeBest ? [{ ...board.allTimeBest, isAllTime: true }] : []),
        ...board.weekly.map((e) => ({ ...e, isAllTime: false })),
      ]
    : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">랭킹</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-center">
        <select
          value={base}
          onChange={(e) => setBase(Number(e.target.value) as Base)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-orange-500"
        >
          {BASES.map((b) => (
            <option key={b} value={b}>
              {b}진수
            </option>
          ))}
        </select>
      </div>

      <p className="text-center text-xs text-slate-500">
        1위는 역대 최고 기록으로 계속 유지되고, 나머지는 최근 7일 기록입니다.
      </p>

      {board === null && <p className="text-center text-slate-500">불러오는 중...</p>}

      {board !== null && rows.length === 0 && (
        <p className="text-center text-slate-500">
          아직 {base}진수 기록이 없습니다. Supabase가 설정되지 않았다면 .env.local에 환경변수를 추가하세요.
        </p>
      )}

      {board !== null && rows.length > 0 && (
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
            {rows.map((entry, i) => (
              <tr
                key={entry.id ?? i}
                className={`border-t border-slate-800 ${entry.isAllTime ? "bg-orange-500/10" : ""}`}
              >
                <td className="px-3 py-2 font-mono text-orange-400">
                  {entry.isAllTime ? "🏆" : i + 1}
                </td>
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

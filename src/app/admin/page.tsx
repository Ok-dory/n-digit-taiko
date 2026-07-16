"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/utils/firebaseClient";
import { RankingManager } from "@/game/RankingManager";
import type { Base, RankingEntry } from "@/types/game";

const BASES: Base[] = Array.from({ length: 15 }, (_, i) => (i + 2) as Base);

export default function AdminPage() {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  if (!auth) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="text-slate-400">Firebase가 설정되지 않아 관리자 기능을 사용할 수 없습니다.</p>
        <Link href="/" className="text-orange-400 hover:text-orange-300">
          홈으로
        </Link>
      </main>
    );
  }

  if (user === undefined) {
    return <main className="flex flex-1 items-center justify-center text-slate-500">확인 중...</main>;
  }

  if (!user) {
    const login = async () => {
      setLoginError(null);
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch {
        setLoginError("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
      }
    };

    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6 py-10">
        <h1 className="text-center text-xl font-bold">관리자 로그인</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          type="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="비밀번호"
          type="password"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        {loginError && <p className="text-center text-sm text-rose-400">{loginError}</p>}
        <button
          onClick={login}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-400"
        >
          로그인
        </button>
        <Link href="/" className="text-center text-sm text-slate-500 hover:text-orange-400">
          홈으로
        </Link>
      </main>
    );
  }

  return <EntryModeration auth={auth} email={user.email ?? ""} />;
}

function EntryModeration({ auth, email }: { auth: NonNullable<ReturnType<typeof getFirebaseAuth>>; email: string }) {
  const [base, setBase] = useState<Base | null>(null);
  const [entries, setEntries] = useState<RankingEntry[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = () => {
    RankingManager.listForAdmin(base).then(setEntries);
  };

  useEffect(() => {
    // Reset to the loading state whenever the selected base changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(null);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const handleDelete = async (entry: RankingEntry) => {
    if (!entry.id) return;
    if (!window.confirm(`"${entry.player_name}" (${entry.score}점) 기록을 삭제할까요?`)) return;
    setDeletingId(entry.id);
    await RankingManager.deleteEntry(entry.id);
    setDeletingId(null);
    reload();
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-orange-400">
          ← 홈
        </Link>
        <h1 className="text-xl font-bold">랭킹 관리</h1>
        <button onClick={() => signOut(auth)} className="text-sm text-slate-500 hover:text-orange-400">
          로그아웃
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">{email}로 로그인됨</p>

      <div className="flex justify-center">
        <select
          value={base ?? "all"}
          onChange={(e) => setBase(e.target.value === "all" ? null : (Number(e.target.value) as Base))}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-orange-500"
        >
          <option value="all">전체 진법</option>
          {BASES.map((b) => (
            <option key={b} value={b}>
              {b}진수
            </option>
          ))}
        </select>
      </div>

      {entries === null && <p className="text-center text-slate-500">불러오는 중...</p>}
      {entries !== null && entries.length === 0 && (
        <p className="text-center text-slate-500">기록이 없습니다.</p>
      )}

      {entries !== null && entries.length > 0 && (
        <table className="w-full overflow-hidden rounded-xl border border-slate-800 text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">이름</th>
              <th className="px-3 py-2 text-right">진법</th>
              <th className="px-3 py-2 text-right">점수</th>
              <th className="px-3 py-2 text-right">날짜</th>
              <th className="px-3 py-2 text-right">삭제</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{entry.player_name}</td>
                <td className="px-3 py-2 text-right font-mono">{entry.base}진수</td>
                <td className="px-3 py-2 text-right font-mono">{entry.score.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-500">
                  {entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => handleDelete(entry)}
                    disabled={deletingId === entry.id}
                    className="rounded-lg bg-rose-900/60 px-3 py-1 text-xs text-rose-300 transition-colors hover:bg-rose-800 disabled:opacity-50"
                  >
                    {deletingId === entry.id ? "삭제 중..." : "삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

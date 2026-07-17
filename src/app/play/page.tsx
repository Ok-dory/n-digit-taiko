"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlayScreen } from "@/components/game/PlayScreen";
import type { Base } from "@/types/game";

function parseBase(raw: string | null): Base {
  const n = Number(raw);
  return n >= 2 && n <= 16 ? (n as Base) : 2;
}

function PlayPageInner() {
  const searchParams = useSearchParams();
  const base = parseBase(searchParams.get("base"));
  const name = (searchParams.get("name") ?? "").trim();

  if (!name) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-bold text-ink-muted">이름이 필요합니다. 홈에서 이름을 입력하고 시작해주세요.</p>
        <Link href="/" className="font-display font-bold text-coral">
          홈으로
        </Link>
      </main>
    );
  }

  return <PlayScreen key={`${base}-${name}`} base={base} playerName={name} />;
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={<main className="flex flex-1 items-center justify-center font-bold text-ink-muted">불러오는 중...</main>}
    >
      <PlayPageInner />
    </Suspense>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PlayScreen } from "@/components/game/PlayScreen";
import { searchParamsToConfig } from "@/utils/gameConfig";

function PlayPageInner() {
  const searchParams = useSearchParams();
  const config = searchParamsToConfig(searchParams);
  return <PlayScreen key={`${config.mode}-${config.base}-${config.difficulty}-${config.duration}`} config={config} />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center text-slate-500">불러오는 중...</main>}>
      <PlayPageInner />
    </Suspense>
  );
}

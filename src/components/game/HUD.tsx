import Link from "next/link";
import type { Base, ScoreState } from "@/types/game";

interface HUDProps {
  scoreState: ScoreState;
  base: Base;
  secondsRemaining: number;
  hps: number;
  bonusActive: boolean;
}

export function HUD({ scoreState, base, secondsRemaining, hps, bonusActive }: HUDProps) {
  const timeLabel = `${Math.ceil(secondsRemaining)}초`;

  return (
    <div className="flex flex-col gap-3 px-5 pt-5">
      <div className="flex items-start justify-between">
        <Link href="/" className="text-sm font-bold text-navy-text">
          ‹ 홈
        </Link>
        <div className="flex items-center gap-2">
          {bonusActive && <span className="animate-pulse text-xs font-bold text-coral">보너스 타임</span>}
          <div className="text-center">
            <div className="text-[9px] font-bold text-navy-text-muted">시간</div>
            <div className="font-mono text-[16px] font-extrabold text-white">{timeLabel}</div>
          </div>
          <div className="rounded-full bg-gold px-3 py-1.5 font-display text-xs font-extrabold text-gold-ink">
            {base}진수
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Stat label="점수" value={scoreState.score.toLocaleString()} />
        <Stat label="콤보" value={`${scoreState.combo}`} accent={scoreState.combo > 0} />
        <Stat label="HPS" value={hps.toFixed(1)} />
        <Stat label="정확도" value={`${scoreState.accuracy}%`} success />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  success,
}: {
  label: string;
  value: string;
  accent?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex-1 rounded-xl bg-navy-deep py-2 text-center">
      <div className="text-[9px] font-bold text-navy-text-muted">{label}</div>
      <div
        className={`font-mono text-sm font-bold ${success ? "text-success" : accent ? "text-coral" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

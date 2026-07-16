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
    <div className="flex flex-wrap items-center justify-between gap-y-2 px-6 py-3 text-sm sm:text-base">
      <div className="flex gap-6">
        <Stat label="점수" value={scoreState.score.toLocaleString()} />
        <Stat label="콤보" value={`${scoreState.combo}`} accent={scoreState.combo > 0} />
        <Stat label="HPS" value={hps.toFixed(1)} />
        <Stat label="정확도" value={`${scoreState.accuracy}%`} />
      </div>
      <div className="flex items-center gap-6">
        {bonusActive && <span className="animate-pulse text-xs font-bold text-rose-400">보너스 타임</span>}
        <Stat label="시간" value={timeLabel} />
        <Stat label={`${base}진수`} value="BASE" accent />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-mono text-lg font-bold ${accent ? "text-orange-400" : "text-slate-100"}`}>{value}</div>
    </div>
  );
}

"use client";

interface BaseSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accent: "coral" | "teal";
}

const ACCENT_VAR: Record<BaseSliderProps["accent"], string> = {
  coral: "var(--color-coral-strong)",
  teal: "var(--color-teal-strong)",
};

const ACCENT_SHADOW: Record<BaseSliderProps["accent"], string> = {
  coral: "oklch(20% 0.05 30 / .3)",
  teal: "oklch(20% 0.05 195 / .3)",
};

/** Custom-styled range slider matching the mockup's gradient track + ringed thumb. */
export function BaseSlider({ value, min, max, onChange, accent }: BaseSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const accentColor = ACCENT_VAR[accent];

  return (
    <div className="relative py-2">
      <div
        className="h-[10px] rounded-md"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, var(--color-gold) ${percent}%, var(--color-cream-border) ${percent}%)`,
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-[22px] w-[22px] rounded-full border-4 bg-white"
        style={{
          left: `${percent}%`,
          transform: "translate(-50%, -50%)",
          borderColor: accentColor,
          boxShadow: `0 3px 8px ${ACCENT_SHADOW[accent]}`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-x-0 top-1/2 h-[26px] w-full -translate-y-1/2 cursor-pointer opacity-0"
      />
    </div>
  );
}

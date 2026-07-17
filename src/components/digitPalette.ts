/** Coral/teal/gold cycle used to color-code digit buttons across the pad and key-settings screen. */
export const DIGIT_PALETTE = [
  {
    grad: "linear-gradient(180deg, var(--color-coral-strong), var(--color-coral-dark))",
    shadow: "var(--color-coral-shadow)",
    solid: "var(--color-coral)",
    text: "text-white",
    textMuted: "text-white/85",
  },
  {
    grad: "linear-gradient(180deg, var(--color-teal-strong), var(--color-teal-dark))",
    shadow: "var(--color-teal-shadow)",
    solid: "var(--color-teal)",
    text: "text-white",
    textMuted: "text-white/85",
  },
  {
    grad: "linear-gradient(180deg, oklch(83% 0.15 95), oklch(70% 0.14 90))",
    shadow: "oklch(60% 0.12 90)",
    solid: "var(--color-gold)",
    text: "text-gold-ink",
    textMuted: "text-gold-ink/75",
  },
];

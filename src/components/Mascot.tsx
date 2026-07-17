interface MascotProps {
  scale?: number;
  digit?: string;
  className?: string;
}

const BASE = {
  width: 104,
  height: 118,
  border: 4,
  footWidth: 16,
  footHeight: 20,
  footRadius: 8,
  footLeft: 30,
  bodyLeft: 6,
  bodyBottom: 16,
  bodyWidth: 76,
  bodyHeight: 64,
  bodyRadius: 26,
  bellyLeft: 14,
  bellyBottom: 38,
  bellyWidth: 60,
  bellyHeight: 16,
  bellyRadius: 8,
  bellyFontSize: 9,
  armSize: 22,
  armRadius: 11,
  armBottom: 56,
  armLeftOffset: -10,
  armRightSize: 20,
  armRightRadius: 10,
  armRightOffset: -6,
  headSize: 76,
  headLeft: 14,
  eyeWidth: 10,
  eyeHeight: 12,
  eyeTop: 26,
  eyeOffset: 18,
  mouthTop: 44,
  mouthLeft: 24,
  mouthWidth: 28,
  mouthHeight: 14,
  mouthRadius: 14,
};

const px = (value: number, scale: number) => `${Math.round(value * scale)}px`;

/** The cube-eyed, waving-arm robot mascot from the game's mockups. */
export function Mascot({ scale = 1, digit = "01", className = "" }: MascotProps) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: px(BASE.width, scale), height: px(BASE.height, scale) }}
    >
      <div
        className="absolute bottom-0 bg-teal-dark"
        style={{
          left: px(BASE.footLeft, scale),
          width: px(BASE.footWidth, scale),
          height: px(BASE.footHeight, scale),
          borderRadius: px(BASE.footRadius, scale),
        }}
      />
      <div
        className="absolute bottom-0 bg-teal-dark"
        style={{
          right: px(BASE.footLeft, scale),
          width: px(BASE.footWidth, scale),
          height: px(BASE.footHeight, scale),
          borderRadius: px(BASE.footRadius, scale),
        }}
      />
      <div
        className="absolute border-white bg-teal"
        style={{
          bottom: px(BASE.bodyBottom, scale),
          left: px(BASE.bodyLeft, scale),
          width: px(BASE.bodyWidth, scale),
          height: px(BASE.bodyHeight, scale),
          borderRadius: px(BASE.bodyRadius, scale),
          borderWidth: px(BASE.border, scale),
        }}
      />
      <div
        className="absolute flex items-center justify-center bg-gold font-mono font-extrabold text-gold-ink"
        style={{
          bottom: px(BASE.bellyBottom, scale),
          left: px(BASE.bellyLeft, scale),
          width: px(BASE.bellyWidth, scale),
          height: px(BASE.bellyHeight, scale),
          borderRadius: px(BASE.bellyRadius, scale),
          fontSize: px(BASE.bellyFontSize, scale),
        }}
      >
        {digit}
      </div>
      <div
        className="animate-wave absolute border-white bg-teal"
        style={{
          bottom: px(BASE.armBottom, scale),
          left: px(BASE.armLeftOffset, scale),
          width: px(BASE.armSize, scale),
          height: px(BASE.armSize, scale),
          borderRadius: px(BASE.armRadius, scale),
          borderWidth: px(BASE.border, scale),
          transformOrigin: "80% 20%",
        }}
      />
      <div
        className="absolute border-white bg-teal"
        style={{
          bottom: px(BASE.armBottom, scale),
          right: px(BASE.armRightOffset, scale),
          width: px(BASE.armRightSize, scale),
          height: px(BASE.armRightSize, scale),
          borderRadius: px(BASE.armRightRadius, scale),
          borderWidth: px(BASE.border, scale),
        }}
      />
      <div
        className="absolute border-white"
        style={{
          top: 0,
          left: px(BASE.headLeft, scale),
          width: px(BASE.headSize, scale),
          height: px(BASE.headSize, scale),
          borderRadius: "50%",
          borderWidth: px(BASE.border, scale),
          background: "radial-gradient(circle at 32% 28%, oklch(70% 0.2 30), oklch(60% 0.19 22))",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: px(BASE.eyeTop, scale),
            left: px(BASE.eyeOffset, scale),
            width: px(BASE.eyeWidth, scale),
            height: px(BASE.eyeHeight, scale),
            background: "oklch(15% 0.01 30)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: px(BASE.eyeTop, scale),
            right: px(BASE.eyeOffset, scale),
            width: px(BASE.eyeWidth, scale),
            height: px(BASE.eyeHeight, scale),
            background: "oklch(15% 0.01 30)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: px(BASE.mouthTop, scale),
            left: px(BASE.mouthLeft, scale),
            width: px(BASE.mouthWidth, scale),
            height: px(BASE.mouthHeight, scale),
            borderRadius: `0 0 ${px(BASE.mouthRadius, scale)} ${px(BASE.mouthRadius, scale)}`,
            background: "oklch(35% 0.12 25)",
          }}
        />
      </div>
    </div>
  );
}

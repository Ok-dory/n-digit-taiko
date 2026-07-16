# N진수 태고 (N-Base Taiko)

Falling-note rhythm game where digits of a random number (base 2–16, chosen at game start) fall
one at a time and you type them in order. Built as a from-scratch web redesign of an earlier
Python/Pygame "Binary Taiko" prototype — not a port.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Canvas API for the falling-note rendering
- Framer Motion for judgment/UI animation
- Howler.js for sound effects
- Supabase (Postgres) for the weekly ranking board
- Deploys to Vercel

## Architecture

Game logic lives entirely under `src/game/` as plain TypeScript classes with no React
dependency; components under `src/components` and `src/app` are UI-only and talk to the engine
through the hooks in `src/hooks/`.

- `BaseConverter` — decimal ⇄ arbitrary-base (2–16) conversion, problem generation
- `InputManager` / `KeyboardInput` — pluggable input sources (`InputSource` interface); adding
  Gamepad/MIDI/Arduino support later means writing a new `InputSource`, no engine changes
- `SettingsManager` — key-binding persistence in `localStorage`
- `TimerManager`, `ScoreManager`, `AudioManager` — countdown/elapsed time, score/combo/accuracy,
  sfx playback
- `GameEngine` — orchestrates the above, owns the canvas render loop and judgment logic
- `RankingManager` — Supabase reads/writes for the 7-day rolling leaderboard

## Local setup

```bash
npm install
npm run dev
```

Ranking and stats pages work without Supabase configured (they show an empty/graceful state).
To enable them, copy `.env.local.example` to `.env.local`, create a Supabase project, run
`supabase/schema.sql` in its SQL editor, and fill in the two `NEXT_PUBLIC_SUPABASE_*` values.

Sound effects are loaded from `/public/sfx/*.mp3` (perfect, good, miss, combo, game-over) but no
audio files are bundled — drop your own in and `AudioManager` will pick them up; missing files
fail silently so gameplay isn't blocked.

## Deploy

Push to GitHub and import the repo on Vercel, or run `vercel deploy` from the project root.
Remember to set the Supabase env vars in the Vercel project settings too.

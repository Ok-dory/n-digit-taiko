# N진수 태고 (N-Base Taiko)

Falling-note rhythm game where digits of a random number (base 2–16, chosen at game start) fall
one at a time and you type them in order. Built as a from-scratch web redesign of an earlier
Python/Pygame "Binary Taiko" prototype — not a port.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Canvas API for the falling-note rendering
- Framer Motion for judgment/UI animation
- Howler.js for sound effects
- Firebase Firestore for the ranking board (one leaderboard per base, plus a
  persistent all-time-best pinned at rank 1)
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
- `RankingManager` — Firestore reads/writes, one board per base with a persistent
  all-time-best plus a 7-day rolling window; falls back to `LocalRankingStore`
  (localStorage) when Firebase isn't configured

## Local setup

```bash
npm install
npm run dev
```

Ranking and stats pages work without Firebase configured (they show an empty/graceful state,
backed by localStorage). To enable a shared cross-device leaderboard:

1. Create a project at [firebase.google.com](https://firebase.google.com) and enable Firestore
   (Native mode).
2. Paste `firebase/firestore.rules` into Firestore Database → Rules in the console.
3. Add the composite indexes in `firebase/firestore.indexes.json` — either via the Firebase CLI
   (`firebase deploy --only firestore:indexes`) or by running the app once against Firestore and
   clicking the auto-generated index-creation link Firestore prints in the console error.
4. Copy `.env.local.example` to `.env.local` and fill in the six `NEXT_PUBLIC_FIREBASE_*` values
   from Project settings → General → Your apps → SDK setup and configuration.

Sound effects are loaded from `/public/sfx/*.mp3` (perfect, good, miss, combo, game-over) but no
audio files are bundled — drop your own in and `AudioManager` will pick them up; missing files
fail silently so gameplay isn't blocked.

## Deploy

Push to GitHub and import the repo on Vercel, or run `vercel deploy` from the project root.
Remember to set the Firebase env vars in the Vercel project settings too.

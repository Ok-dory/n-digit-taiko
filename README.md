# N진수 태고 (N-Base Taiko)

Reaction-speed game: a random number appears (base 2–16, chosen at game start) and you key in
its digits, in order, as fast and accurately as possible — no timing window, just right or wrong.
Built as a from-scratch web redesign of an earlier Python/Pygame "Binary Taiko" prototype that
worked the same way (two-button binary version); this generalizes it to any base and adds a
web UI — not a port.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion for bonus/UI animation
- Howler.js for sound effects
- Firebase Firestore for the ranking board (one leaderboard per base, plus a
  persistent all-time-best pinned at rank 1) and Firebase Auth for admin moderation
- Deploys to Vercel

## Architecture

Game logic lives entirely under `src/game/` as plain TypeScript classes with no React
dependency; components under `src/components` and `src/app` are UI-only and talk to the engine
through the hooks in `src/hooks/`.

- `BaseConverter` — decimal ⇄ arbitrary-base (2–16) conversion, problem generation
- `InputManager` / `KeyboardInput` — pluggable input sources (`InputSource` interface); adding
  Gamepad/MIDI/Arduino support later means writing a new `InputSource`, no engine changes
- `SettingsManager` — key-binding persistence in `localStorage`
- `TimerManager`, `ScoreManager`, `AudioManager` — 30-second countdown, score/combo/accuracy
  (+10 correct / −5 wrong, combo-and-digit-transition completion bonus), sfx playback
- `GameEngine` — orchestrates the above and drives the round; no rendering, UI reads its state
  entirely through callbacks
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

### Admin ranking moderation

`/admin` lets a single authorized account delete inappropriate ranking entries.

1. In the Firebase console, enable **Authentication → Sign-in method → Email/Password**.
2. Under **Authentication → Users**, manually add the one admin account (there's no public
   sign-up form in the app). The Firestore rules only grant delete access to that exact email.
3. Sign in at `/admin` with that account to browse and delete entries per base.

Sound effects are loaded from `/public/sfx/*.mp3` (correct, wrong, bonus, game-over) but no
audio files are bundled — drop your own in and `AudioManager` will pick them up; missing files
fail silently so gameplay isn't blocked.

## Deploy

Push to GitHub and import the repo on Vercel, or run `vercel deploy` from the project root.
Remember to set the Firebase env vars in the Vercel project settings too.

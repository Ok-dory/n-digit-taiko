import { Howl } from "howler";
import type { Judgment } from "@/types/game";

export type SfxKey = Judgment | "bonus" | "gameOver";

const SFX_SOURCES: Record<SfxKey, string> = {
  correct: "/sfx/correct.mp3",
  wrong: "/sfx/wrong.mp3",
  bonus: "/sfx/bonus.mp3",
  gameOver: "/sfx/game-over.mp3",
};

/**
 * Thin wrapper around Howler.js. Sound files are loaded lazily and
 * missing assets fail silently so gameplay isn't blocked before real
 * sfx are dropped into /public/sfx.
 */
export class AudioManager {
  private sounds = new Map<SfxKey, Howl>();
  private muted = false;

  preload(): void {
    (Object.keys(SFX_SOURCES) as SfxKey[]).forEach((key) => {
      if (this.sounds.has(key)) return;
      const howl = new Howl({ src: [SFX_SOURCES[key]], preload: true, onloaderror: () => {} });
      this.sounds.set(key, howl);
    });
  }

  play(key: SfxKey): void {
    if (this.muted) return;
    this.sounds.get(key)?.play();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  destroy(): void {
    for (const sound of this.sounds.values()) sound.unload();
    this.sounds.clear();
  }
}

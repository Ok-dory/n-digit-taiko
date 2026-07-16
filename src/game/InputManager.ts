import type { InputAction, KeyBindingMap } from "@/types/game";

export type InputEventListener = (action: InputAction, timestamp: number) => void;

/**
 * A physical input source (keyboard, gamepad, MIDI, Arduino/serial, ...).
 * Implementations translate raw device events into logical InputActions
 * using the shared KeyBindingMap, so the game engine never needs to know
 * which device produced an action.
 */
export interface InputSource {
  readonly id: string;
  start(onAction: InputEventListener): void;
  stop(): void;
  /** Called whenever bindings change so the source can rebuild its lookup table. */
  setBindings(bindings: KeyBindingMap): void;
}

/**
 * Central hub the GameEngine talks to. Owns zero or more InputSources and
 * fans their events out to subscribers. New device types are added by
 * implementing InputSource and calling registerSource() — no changes to
 * the engine or UI are required.
 */
export class InputManager {
  private sources = new Map<string, InputSource>();
  private listeners = new Set<InputEventListener>();
  private bindings: KeyBindingMap;

  constructor(initialBindings: KeyBindingMap) {
    this.bindings = initialBindings;
  }

  registerSource(source: InputSource): void {
    source.setBindings(this.bindings);
    source.start((action, timestamp) => this.emit(action, timestamp));
    this.sources.set(source.id, source);
  }

  unregisterSource(id: string): void {
    this.sources.get(id)?.stop();
    this.sources.delete(id);
  }

  updateBindings(bindings: KeyBindingMap): void {
    this.bindings = bindings;
    for (const source of this.sources.values()) {
      source.setBindings(bindings);
    }
  }

  onAction(listener: InputEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    for (const source of this.sources.values()) source.stop();
    this.sources.clear();
    this.listeners.clear();
  }

  private emit(action: InputAction, timestamp: number): void {
    for (const listener of this.listeners) listener(action, timestamp);
  }
}

/** Keyboard-driven InputSource. Bindings map a KeyboardEvent.code to a digit symbol. */
export class KeyboardInput implements InputSource {
  readonly id = "keyboard";
  private codeToAction = new Map<string, InputAction>();
  private handler = (event: KeyboardEvent) => {
    const action = this.codeToAction.get(event.code);
    if (!action) return;
    event.preventDefault();
    this.onAction?.(action, performance.now());
  };
  private onAction?: InputEventListener;

  setBindings(bindings: KeyBindingMap): void {
    this.codeToAction = new Map(
      Object.entries(bindings).map(([action, code]) => [code, action as InputAction])
    );
  }

  start(onAction: InputEventListener): void {
    this.onAction = onAction;
    window.addEventListener("keydown", this.handler);
  }

  stop(): void {
    window.removeEventListener("keydown", this.handler);
    this.onAction = undefined;
  }
}

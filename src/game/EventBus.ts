import Phaser from 'phaser';
import type { SceneKey } from './constants';

/** Barramento de eventos global entre cenas, UI HTML e testes. */
export const EventBus = new Phaser.Events.EventEmitter();

export const EVENTS = {
  SceneChanged: 'scene-changed',
} as const;

export function announceScene(key: SceneKey): void {
  EventBus.emit(EVENTS.SceneChanged, key);
}

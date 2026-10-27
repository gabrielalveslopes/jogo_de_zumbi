import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { announceScene } from '../game/EventBus';
import { createPlaceholderTextures } from '../game/PlaceholderTextures';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Preload);
  }

  create(): void {
    announceScene(SCENE_KEYS.Preload);
    createPlaceholderTextures(this);
    this.scene.start(SCENE_KEYS.MainMenu);
  }
}

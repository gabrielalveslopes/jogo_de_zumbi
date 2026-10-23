import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { announceScene } from '../game/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Boot);
  }

  create(): void {
    announceScene(SCENE_KEYS.Boot);
    // Impede o menu de contexto do navegador sobre o canvas.
    this.input.mouse?.disableContextMenu();
    this.scene.start(SCENE_KEYS.Preload);
  }
}

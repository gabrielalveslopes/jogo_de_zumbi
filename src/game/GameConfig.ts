import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    // AUTO: WebGL quando disponível, com fallback automático para Canvas.
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.background,
    pixelArt: true, // filtragem nearest-neighbor
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: { target: 60, smoothStep: true },
    input: { keyboard: true, mouse: true, touch: true },
    scene: [BootScene, PreloadScene, MainMenuScene, GameScene],
  };
}

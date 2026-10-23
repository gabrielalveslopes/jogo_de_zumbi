import Phaser from 'phaser';
import { COLORS, SCENE_KEYS, TEXTURE_KEYS } from '../game/constants';
import { announceScene } from '../game/EventBus';

/**
 * Fase 1: não há assets externos. Gera texturas placeholder em pixel art por código,
 * para que o jogo nunca dependa de arte final ou de rede.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.Preload);
  }

  create(): void {
    announceScene(SCENE_KEYS.Preload);
    this.createPlayerTexture();
    this.createZombieTexture();
    this.createFloorTexture();
    this.scene.start(SCENE_KEYS.MainMenu);
  }

  private makeTexture(key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void): void {
    if (this.textures.exists(key)) return; // nunca duplicar texturas
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createPlayerTexture(): void {
    this.makeTexture(TEXTURE_KEYS.Player, 16, 16, (g) => {
      g.fillStyle(0x1b1f1d).fillRect(3, 14, 10, 2); // sombra
      g.fillStyle(0x3d5a3a).fillRect(4, 6, 8, 8); // corpo
      g.fillStyle(0xd2a679).fillRect(5, 1, 6, 6); // cabeça
      g.fillStyle(0x222222).fillRect(5, 1, 6, 2); // cabelo
      g.fillStyle(0x6b6f6c).fillRect(11, 8, 4, 2); // arma
    });
  }

  private createZombieTexture(): void {
    this.makeTexture(TEXTURE_KEYS.Zombie, 16, 16, (g) => {
      g.fillStyle(0x1b1f1d).fillRect(3, 14, 10, 2);
      g.fillStyle(0x4a5a3a).fillRect(4, 6, 8, 8);
      g.fillStyle(COLORS.toxicGreen).fillRect(5, 1, 6, 6);
      g.fillStyle(COLORS.blood).fillRect(6, 3, 1, 1).fillRect(9, 3, 1, 1);
      g.fillStyle(0x4a5a3a).fillRect(1, 7, 3, 2).fillRect(12, 7, 3, 2);
    });
  }

  private createFloorTexture(): void {
    this.makeTexture(TEXTURE_KEYS.Floor, 32, 32, (g) => {
      g.fillStyle(0x181b19).fillRect(0, 0, 32, 32);
      g.fillStyle(0x1f2321).fillRect(0, 0, 16, 16).fillRect(16, 16, 16, 16);
      g.fillStyle(0x121412).fillRect(5, 9, 3, 1).fillRect(22, 24, 4, 1).fillRect(24, 6, 1, 3);
    });
  }
}

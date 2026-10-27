import Phaser from 'phaser';
import { COLORS, TEXTURE_KEYS } from './constants';

function make(
  scene: Phaser.Scene, key: string, w: number, h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) return; // nunca duplicar texturas
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

/** Texturas placeholder em pixel art, geradas por código (sem assets externos). */
export function createPlaceholderTextures(scene: Phaser.Scene): void {
  make(scene, TEXTURE_KEYS.Player, 16, 16, (g) => {
    g.fillStyle(0x1b1f1d).fillRect(3, 14, 10, 2);
    g.fillStyle(0x3d5a3a).fillRect(4, 6, 8, 8);
    g.fillStyle(0xd2a679).fillRect(5, 1, 6, 6);
    g.fillStyle(0x222222).fillRect(5, 1, 6, 2);
    g.fillStyle(0x6b6f6c).fillRect(11, 8, 4, 2);
  });

  // Caminhante: verde, braços estendidos
  make(scene, TEXTURE_KEYS.Zombie, 16, 16, (g) => {
    g.fillStyle(0x1b1f1d).fillRect(3, 14, 10, 2);
    g.fillStyle(0x4a5a3a).fillRect(4, 6, 8, 8);
    g.fillStyle(COLORS.toxicGreen).fillRect(5, 1, 6, 6);
    g.fillStyle(COLORS.blood).fillRect(6, 3, 1, 1).fillRect(9, 3, 1, 1);
    g.fillStyle(0x4a5a3a).fillRect(1, 7, 3, 2).fillRect(12, 7, 3, 2);
  });

  // Corredor: magro, avermelhado, olhos amarelos
  make(scene, TEXTURE_KEYS.Runner, 16, 16, (g) => {
    g.fillStyle(0x1b1f1d).fillRect(4, 14, 8, 2);
    g.fillStyle(0x6a3a3a).fillRect(5, 6, 6, 8);
    g.fillStyle(0xc98a6a).fillRect(5, 1, 6, 6);
    g.fillStyle(0xffd23a).fillRect(6, 3, 1, 1).fillRect(9, 3, 1, 1);
    g.fillStyle(0x6a3a3a).fillRect(2, 6, 3, 1).fillRect(11, 6, 3, 1);
  });

  // Bruto: grande, robusto, olhos vermelhos
  make(scene, TEXTURE_KEYS.Brute, 24, 24, (g) => {
    g.fillStyle(0x1b1f1d).fillRect(3, 21, 18, 3);
    g.fillStyle(0x4a3d32).fillRect(4, 9, 16, 13);
    g.fillStyle(0x8a9a5a).fillRect(7, 1, 10, 9);
    g.fillStyle(0xff3a2a).fillRect(9, 4, 2, 2).fillRect(13, 4, 2, 2);
    g.fillStyle(0x6a7a45).fillRect(0, 9, 4, 9).fillRect(20, 9, 4, 9);
    g.fillStyle(0x2a241d).fillRect(8, 14, 8, 2);
  });

  // Rastejante: baixo e comprido
  make(scene, TEXTURE_KEYS.Crawler, 14, 8, (g) => {
    g.fillStyle(0x1b1f1d).fillRect(1, 7, 12, 1);
    g.fillStyle(0x3d4a2e).fillRect(1, 3, 9, 4);
    g.fillStyle(0x6fae45).fillRect(9, 1, 4, 5);
    g.fillStyle(COLORS.blood).fillRect(11, 2, 1, 1);
    g.fillStyle(0x3d4a2e).fillRect(0, 2, 2, 1).fillRect(0, 6, 2, 1);
  });

  make(scene, TEXTURE_KEYS.Bullet, 4, 4, (g) => {
    g.fillStyle(0xffe27a).fillRect(0, 0, 4, 4);
    g.fillStyle(0xffffff).fillRect(1, 1, 2, 2);
  });

  make(scene, TEXTURE_KEYS.Floor, 32, 32, (g) => {
    g.fillStyle(0x181b19).fillRect(0, 0, 32, 32);
    g.fillStyle(0x1f2321).fillRect(0, 0, 16, 16).fillRect(16, 16, 16, 16);
    g.fillStyle(0x121412).fillRect(5, 9, 3, 1).fillRect(22, 24, 4, 1).fillRect(24, 6, 1, 3);
  });
}

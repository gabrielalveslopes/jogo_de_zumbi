import Phaser from 'phaser';
import {
  COLORS, FONT_FAMILY, MAX_DELTA_MS, PLAYER_SPEED, SCENE_KEYS, TEXTURE_KEYS, WORLD_SIZE,
} from '../game/constants';
import { announceScene } from '../game/EventBus';
import { clamp, clampDelta, normalize } from '../utils/math';

interface Keys {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  esc: Phaser.Input.Keyboard.Key;
}

/**
 * Sandbox da Fase 1: valida movimento normalizado, câmera suave com limites,
 * clamp de delta e troca de cenas. Combate, inimigos e armas entram na Fase 2.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private keys!: Keys;

  constructor() {
    super(SCENE_KEYS.Game);
  }

  create(): void {
    announceScene(SCENE_KEYS.Game);
    const kb = this.input.keyboard;
    if (!kb) throw new Error('Teclado indisponível neste ambiente.');

    this.keys = {
      w: kb.addKey('W'), a: kb.addKey('A'), s: kb.addKey('S'), d: kb.addKey('D'),
      up: kb.addKey('UP'), left: kb.addKey('LEFT'), down: kb.addKey('DOWN'), right: kb.addKey('RIGHT'),
      esc: kb.addKey('ESC'),
    };

    this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, TEXTURE_KEYS.Floor).setOrigin(0);
    this.player = this.add.image(WORLD_SIZE / 2, WORLD_SIZE / 2, TEXTURE_KEYS.Player);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);

    this.add
      .text(8, 8, 'FASE 1 — sandbox de movimento\nWASD/Setas: mover  •  ESC: menu', {
        fontFamily: FONT_FAMILY, fontSize: '10px', color: COLORS.text,
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  override update(_time: number, deltaMs: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.scene.start(SCENE_KEYS.MainMenu);
      return;
    }

    const dt = clampDelta(deltaMs, MAX_DELTA_MS) / 1000;
    const k = this.keys;
    const ix = (k.d.isDown || k.right.isDown ? 1 : 0) - (k.a.isDown || k.left.isDown ? 1 : 0);
    const iy = (k.s.isDown || k.down.isDown ? 1 : 0) - (k.w.isDown || k.up.isDown ? 1 : 0);
    const dir = normalize(ix, iy);

    this.player.x = clamp(this.player.x + dir.x * PLAYER_SPEED * dt, 8, WORLD_SIZE - 8);
    this.player.y = clamp(this.player.y + dir.y * PLAYER_SPEED * dt, 8, WORLD_SIZE - 8);
    if (dir.x !== 0) this.player.setFlipX(dir.x < 0);
  }
}

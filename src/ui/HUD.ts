import Phaser from 'phaser';
import { COLORS, DEPTH_HUD, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { formatTime } from '../utils/format';

export interface HudState {
  hp: number;
  maxHp: number;
  timeSec: number;
  kills: number;
  enemies: number;
  projectiles: number;
  pickups: number;
  level: number;
  xp: number;
  xpToNext: number;
}

const BAR_W = 104;

/** HUD fixo na tela. Só redesenha/atualiza textos quando o valor muda. */
export class HUD {
  private readonly bar: Phaser.GameObjects.Graphics;
  private readonly xpBar: Phaser.GameObjects.Graphics;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text;
  private readonly killText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly debugText: Phaser.GameObjects.Text;
  private lastHp = -1;
  private lastMaxHp = -1;
  private lastSec = -1;
  private lastKills = -1;
  private lastLevel = -1;
  private lastXp = -1;
  private lastDebugMs = 0;
  private debugOn = false;

  constructor(private readonly scene: Phaser.Scene) {
    const style = { fontFamily: FONT_FAMILY, fontSize: '10px', color: COLORS.text };
    this.bar = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH_HUD);
    this.xpBar = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH_HUD);
    this.hpText = scene.add.text(14, 9, '', style).setScrollFactor(0).setDepth(DEPTH_HUD + 1);
    this.timeText = scene.add
      .text(GAME_WIDTH / 2, 8, '00:00', { ...style, fontSize: '14px' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH_HUD);
    this.killText = scene.add
      .text(GAME_WIDTH - 8, 8, '', { ...style, fontSize: '12px' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH_HUD);
    this.levelText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '', { ...style, color: COLORS.textAccent })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(DEPTH_HUD + 1);
    this.debugText = scene.add
      .text(8, 28, '', { ...style, color: COLORS.textAccent })
      .setScrollFactor(0).setDepth(DEPTH_HUD).setVisible(false);
  }

  toggleDebug(): void {
    this.debugOn = !this.debugOn;
    this.debugText.setVisible(this.debugOn);
  }

  update(s: HudState, nowMs: number): void {
    const hp = Math.max(0, Math.ceil(s.hp));
    if (hp !== this.lastHp || s.maxHp !== this.lastMaxHp) {
      this.lastHp = hp;
      this.lastMaxHp = s.maxHp;
      const ratio = s.maxHp > 0 ? Math.min(1, hp / s.maxHp) : 0;
      const color = ratio > 0.5 ? COLORS.toxicGreen : ratio > 0.25 ? 0xd9b92e : COLORS.blood;
      this.bar.clear();
      this.bar.fillStyle(0x000000, 0.6).fillRect(8, 6, BAR_W, 16);
      this.bar.fillStyle(color, 1).fillRect(10, 8, Math.round((BAR_W - 4) * ratio), 12);
      this.hpText.setText(`${hp}/${s.maxHp}`);
    }

    const sec = Math.floor(s.timeSec);
    if (sec !== this.lastSec) {
      this.lastSec = sec;
      this.timeText.setText(formatTime(sec));
    }

    if (s.kills !== this.lastKills) {
      this.lastKills = s.kills;
      this.killText.setText(`Abates: ${s.kills}`);
    }

    if (s.level !== this.lastLevel || s.xp !== this.lastXp) {
      this.lastLevel = s.level;
      this.lastXp = s.xp;
      const ratio = s.xpToNext > 0 ? Math.min(1, s.xp / s.xpToNext) : 0;
      this.xpBar.clear();
      this.xpBar.fillStyle(0x000000, 0.6).fillRect(0, GAME_HEIGHT - 7, GAME_WIDTH, 7);
      this.xpBar.fillStyle(0x4aa3ff, 1).fillRect(1, GAME_HEIGHT - 6, Math.round((GAME_WIDTH - 2) * ratio), 5);
      this.levelText.setText(`NV ${s.level}`);
    }

    if (this.debugOn && nowMs - this.lastDebugMs >= 250) {
      this.lastDebugMs = nowMs;
      const fps = Math.round(this.scene.game.loop.actualFps);
      this.debugText.setText(
        `FPS ${fps} | inimigos ${s.enemies} | projéteis ${s.projectiles} | itens ${s.pickups}`,
      );
    }
  }
}

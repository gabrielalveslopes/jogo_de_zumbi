import Phaser from 'phaser';
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, TEXTURE_KEYS } from '../game/constants';
import { announceScene } from '../game/EventBus';

interface MenuItem {
  label: string;
  enabled: boolean;
  action?: () => void;
}

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MainMenu);
  }

  create(): void {
    announceScene(SCENE_KEYS.MainMenu);
    const cx = GAME_WIDTH / 2;

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, TEXTURE_KEYS.Floor).setOrigin(0).setAlpha(0.6);
    this.createFog();

    this.add
      .text(cx, 50, 'ZOMBIE APOCALYPSE', {
        fontFamily: FONT_FAMILY, fontSize: '32px', fontStyle: 'bold', color: COLORS.textAccent,
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 84, 'L A S T   S T A N D', {
        fontFamily: FONT_FAMILY, fontSize: '16px', color: '#a3201a',
      })
      .setOrigin(0.5);

    // Zumbi decorativo.
    this.add.image(cx - 150, 140, TEXTURE_KEYS.Zombie).setScale(3);
    this.add.image(cx + 150, 140, TEXTURE_KEYS.Player).setScale(3);

    const items: MenuItem[] = [
      { label: 'JOGAR', enabled: true, action: () => this.startGame() },
      { label: 'Sobreviventes (em breve)', enabled: false },
      { label: 'Arsenal (em breve)', enabled: false },
      { label: 'Configurações (em breve)', enabled: false },
    ];

    items.forEach((item, i) => {
      const t = this.add
        .text(cx, 175 + i * 28, item.label, {
          fontFamily: FONT_FAMILY,
          fontSize: item.enabled ? '20px' : '14px',
          color: item.enabled ? COLORS.text : COLORS.textDim,
        })
        .setOrigin(0.5);
      if (item.enabled && item.action) {
        const action = item.action;
        t.setInteractive({ useHandCursor: true })
          .on('pointerover', () => t.setColor(COLORS.textAccent))
          .on('pointerout', () => t.setColor(COLORS.text))
          .on('pointerdown', action);
      }
    });

    this.add
      .text(cx, GAME_HEIGHT - 20, 'ENTER / ESPAÇO ou clique em JOGAR  •  Fase 1: fundação', {
        fontFamily: FONT_FAMILY, fontSize: '10px', color: COLORS.textDim,
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard;
    kb?.once('keydown-ENTER', () => this.startGame());
    kb?.once('keydown-SPACE', () => this.startGame());
  }

  private startGame(): void {
    this.scene.start(SCENE_KEYS.Game);
  }

  /** Névoa leve: poucos retângulos animados por tween (barato, sem pós-processamento). */
  private createFog(): void {
    for (let i = 0; i < 8; i++) {
      const w = 160 + (i % 3) * 60;
      const rect = this.add
        .rectangle((i * 97) % GAME_WIDTH, 40 + ((i * 53) % (GAME_HEIGHT - 80)), w, 40, 0x7bd34a, 0.04)
        .setOrigin(0.5);
      this.tweens.add({
        targets: rect,
        x: rect.x + (i % 2 === 0 ? 60 : -60),
        alpha: 0.09,
        duration: 4000 + i * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}

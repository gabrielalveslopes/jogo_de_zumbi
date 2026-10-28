import Phaser from 'phaser';
import { FALLBACK_UPGRADE, RARITY_INFO, type UpgradeDef } from '../data/upgrades';
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import { EVENTS, EventBus, announceScene } from '../game/EventBus';

interface UpgradeSceneData {
  level: number;
  choices: UpgradeDef[];
}

const CARD_W = 190;
const CARD_H = 170;
const GAP = 14;
const INPUT_LOCK_MS = 250;

/** Overlay exibido sobre a GameScene (pausada). Emite UpgradeChosen exatamente uma vez. */
export class UpgradeScene extends Phaser.Scene {
  private choices: UpgradeDef[] = [];
  private level = 1;
  private selected = 0;
  private ready = false;
  private chosen = false;
  private cards: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super(SCENE_KEYS.Upgrade);
  }

  init(data: Partial<UpgradeSceneData>): void {
    this.choices = data.choices && data.choices.length > 0 ? data.choices : [FALLBACK_UPGRADE];
    this.level = data.level ?? 1;
    this.selected = 0;
    this.ready = false;
    this.chosen = false;
    this.cards = [];
  }

  create(): void {
    announceScene(SCENE_KEYS.Upgrade);
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78).setOrigin(0);
    this.add
      .text(cx, 36, `NÍVEL ${this.level}!`, { fontFamily: FONT_FAMILY, fontSize: '26px', fontStyle: 'bold', color: COLORS.textAccent })
      .setOrigin(0.5);
    this.add
      .text(cx, 66, 'Escolha uma melhoria', { fontFamily: FONT_FAMILY, fontSize: '12px', color: COLORS.text })
      .setOrigin(0.5);

    const n = this.choices.length;
    const totalW = n * CARD_W + (n - 1) * GAP;
    const startX = (GAME_WIDTH - totalW) / 2 + CARD_W / 2;
    const y = GAME_HEIGHT / 2 + 20;

    this.choices.forEach((def, i) => {
      const x = startX + i * (CARD_W + GAP);
      const info = RARITY_INFO[def.rarity];
      const card = this.add.rectangle(x, y, CARD_W, CARD_H, 0x14181a).setStrokeStyle(2, info.color);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => this.select(i));
      card.on('pointerdown', () => {
        this.select(i);
        this.confirm();
      });
      this.cards.push(card);

      const textStyle = { fontFamily: FONT_FAMILY, color: COLORS.text, align: 'center', wordWrap: { width: CARD_W - 20 } };
      this.add.text(x, y - CARD_H / 2 + 8, `[${i + 1}]`, { ...textStyle, fontSize: '10px', color: COLORS.textDim }).setOrigin(0.5, 0);
      this.add.text(x, y - 56, def.name, { ...textStyle, fontSize: '14px', fontStyle: 'bold' }).setOrigin(0.5, 0);
      this.add.text(x, y - 14, info.label.toUpperCase(), { ...textStyle, fontSize: '10px', color: info.css }).setOrigin(0.5, 0);
      this.add.text(x, y + 8, def.description, { ...textStyle, fontSize: '12px' }).setOrigin(0.5, 0);
    });

    this.add
      .text(cx, GAME_HEIGHT - 22, '← → + ENTER, teclas 1-3 ou clique', {
        fontFamily: FONT_FAMILY, fontSize: '10px', color: COLORS.textDim,
      })
      .setOrigin(0.5);

    this.select(0);

    const kb = this.input.keyboard;
    kb?.on('keydown-LEFT', () => this.move(-1));
    kb?.on('keydown-A', () => this.move(-1));
    kb?.on('keydown-RIGHT', () => this.move(1));
    kb?.on('keydown-D', () => this.move(1));
    kb?.on('keydown-ENTER', () => this.confirm());
    kb?.on('keydown-SPACE', () => this.confirm());
    kb?.on('keydown-ONE', () => this.pick(0));
    kb?.on('keydown-TWO', () => this.pick(1));
    kb?.on('keydown-THREE', () => this.pick(2));

    // Trava breve de entrada: evita escolher sem querer por uma tecla já pressionada.
    this.time.delayedCall(INPUT_LOCK_MS, () => {
      this.ready = true;
    });
  }

  private select(i: number): void {
    this.selected = i;
    this.cards.forEach((card, idx) => {
      const def = this.choices[idx];
      if (!def) return;
      const selected = idx === i;
      card.setFillStyle(selected ? 0x263033 : 0x14181a);
      card.setStrokeStyle(selected ? 4 : 2, RARITY_INFO[def.rarity].color);
    });
  }

  private move(delta: number): void {
    const n = this.choices.length;
    this.select((this.selected + delta + n) % n);
  }

  private pick(i: number): void {
    if (i >= this.choices.length) return;
    this.select(i);
    this.confirm();
  }

  private confirm(): void {
    if (!this.ready || this.chosen) return;
    const def = this.choices[this.selected];
    if (!def) return;
    this.chosen = true;
    EventBus.emit(EVENTS.UpgradeChosen, def.id);
    this.scene.stop();
  }
}

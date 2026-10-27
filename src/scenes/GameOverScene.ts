import Phaser from 'phaser';
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';
import { announceScene } from '../game/EventBus';
import { formatTime } from '../utils/format';

interface GameOverData {
  timeSec: number;
  kills: number;
}

export class GameOverScene extends Phaser.Scene {
  private stats: GameOverData = { timeSec: 0, kills: 0 };

  constructor() {
    super(SCENE_KEYS.GameOver);
  }

  init(data: Partial<GameOverData>): void {
    this.stats = { timeSec: data.timeSec ?? 0, kills: data.kills ?? 0 };
  }

  create(): void {
    announceScene(SCENE_KEYS.GameOver);
    const cx = GAME_WIDTH / 2;
    const text = (y: number, s: string, size: string, color: string) =>
      this.add.text(cx, y, s, { fontFamily: FONT_FAMILY, fontSize: size, color }).setOrigin(0.5);

    text(70, 'VOCÊ MORREU', '32px', '#a3201a');
    text(130, `Sobreviveu por ${formatTime(this.stats.timeSec)}`, '16px', COLORS.text);
    text(156, `Infectados abatidos: ${this.stats.kills}`, '16px', COLORS.text);
    text(230, 'ENTER / R: tentar de novo', '14px', COLORS.textAccent);
    text(254, 'ESC: menu principal', '14px', COLORS.textDim);
    text(GAME_HEIGHT - 16, 'Resultados ainda não são salvos (Fase 6)', '10px', COLORS.textDim);

    const kb = this.input.keyboard;
    const restart = (): void => { this.scene.start(SCENE_KEYS.Game); };
    kb?.once('keydown-ENTER', restart);
    kb?.once('keydown-R', restart);
    kb?.once('keydown-ESC', () => this.scene.start(SCENE_KEYS.MainMenu));
  }
}

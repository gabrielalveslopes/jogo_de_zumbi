/** Resolução interna de referência (pixel art 16-bit). */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

/** Limite do delta por frame (ms): evita saltos após pausa/perda de foco. */
export const MAX_DELTA_MS = 50;

export const SCENE_KEYS = {
  Boot: 'BootScene',
  Preload: 'PreloadScene',
  MainMenu: 'MainMenuScene',
  Game: 'GameScene',
  GameOver: 'GameOverScene',
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

export const TEXTURE_KEYS = {
  Player: 'tex-player',
  Zombie: 'tex-zombie',
  Runner: 'tex-runner',
  Brute: 'tex-brute',
  Crawler: 'tex-crawler',
  Bullet: 'tex-bullet',
  Floor: 'tex-floor',
} as const;

export const COLORS = {
  background: 0x0b0d0c,
  toxicGreen: 0x7bd34a,
  blood: 0xa3201a,
  ash: 0x8a8d8b,
  text: '#d9d9d9',
  textDim: '#6b6f6c',
  textAccent: '#7bd34a',
} as const;

export const FONT_FAMILY = 'monospace';
export const WORLD_SIZE = 2048;
export const PLAYER_SPEED = 90; // px/s

/** Profundidades fixas para camadas de UI (entidades usam depth = y). */
export const DEPTH_HUD = 10000;
export const DEPTH_OVERLAY = 20000;

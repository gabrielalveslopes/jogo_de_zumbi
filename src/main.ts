import Phaser from 'phaser';
import { createGameConfig } from './game/GameConfig';
import { EVENTS, EventBus } from './game/EventBus';

function showBootError(error: unknown): void {
  const el = document.getElementById('boot-error');
  if (!el) return;
  const msg = error instanceof Error ? error.message : String(error);
  el.style.display = 'block';
  el.innerHTML = '<h1>Falha ao iniciar o jogo</h1><p>Seu navegador pode não suportar WebGL/Canvas ou bloqueou o recurso.</p>';
  const pre = document.createElement('pre');
  pre.textContent = msg; // textContent: nunca injetar HTML de erro
  el.appendChild(pre);
}

// Expõe a cena ativa no DOM (diagnóstico e testes E2E).
EventBus.on(EVENTS.SceneChanged, (key: string) => {
  document.body.dataset['scene'] = key;
});

try {
  const game = new Phaser.Game(createGameConfig('game'));
  window.addEventListener('beforeunload', () => game.destroy(true));
} catch (error) {
  console.error(error);
  showBootError(error);
}

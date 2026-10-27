import { expect, test } from '@playwright/test';

const scene = (page: import('@playwright/test').Page) => page.locator('body');

test('inicia sem erros e chega ao menu principal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(scene(page)).toHaveAttribute('data-scene', 'MainMenuScene');
  expect(errors).toEqual([]);
});

test('ENTER inicia a partida; ESC pausa e M volta ao menu', async ({ page }) => {
  await page.goto('/');
  await expect(scene(page)).toHaveAttribute('data-scene', 'MainMenuScene');
  await page.keyboard.press('Enter');
  await expect(scene(page)).toHaveAttribute('data-scene', 'GameScene');
  await page.keyboard.press('Escape');
  await expect(scene(page)).toHaveAttribute('data-scene', 'GameScene'); // pausa não troca de cena
  await page.keyboard.press('m');
  await expect(scene(page)).toHaveAttribute('data-scene', 'MainMenuScene');
});

test('a partida roda alguns segundos movendo o jogador, sem erros', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.keyboard.press('Enter');
  await expect(scene(page)).toHaveAttribute('data-scene', 'GameScene');
  await page.keyboard.down('d');
  await page.waitForTimeout(3000);
  await page.keyboard.up('d');
  await expect(scene(page)).toHaveAttribute('data-scene', 'GameScene');
  expect(errors).toEqual([]);
});

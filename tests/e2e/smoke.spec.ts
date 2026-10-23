import { expect, test } from '@playwright/test';

test('inicia sem erros e chega ao menu principal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'MainMenuScene');
  expect(errors).toEqual([]);
});

test('ENTER inicia o sandbox e ESC volta ao menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'MainMenuScene');
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'GameScene');
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'MainMenuScene');
});

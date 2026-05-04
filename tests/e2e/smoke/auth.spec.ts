// Playwright smoke spec (placeholder). Requires Playwright setup to run.
import { test, expect } from '@playwright/test';

test('home, register and login pages render', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/BookClub Pro|Create Next App/i);

  await page.goto('http://localhost:3000/register');
  await expect(page.locator('text=Zarejestruj się')).toBeVisible();

  await page.goto('http://localhost:3000/login');
  await expect(page.locator('text=Zaloguj się')).toBeVisible();
});

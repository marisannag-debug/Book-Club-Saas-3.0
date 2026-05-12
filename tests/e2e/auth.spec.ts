import { expect, test } from '@playwright/test';

test.describe('auth pages', () => {
  test('register flow works on /register', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Zarejestruj się' })).toBeVisible();

    await page.getByLabel('Email').fill('reader@example.com');
    await page.getByLabel('Hasło').fill('secret123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page.getByRole('status')).toHaveText(/Zarejestrowano/);
  });

  test('login flow works on /login', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();

    await page.getByLabel('Email').fill('reader@example.com');
    await page.getByLabel('Hasło').fill('secret123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();

    await expect(page.getByRole('status')).toHaveText(/Zalogowano/);
  });
});
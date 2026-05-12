import { expect, test } from '@playwright/test';

function buildUniqueEmail() {
  return `reader${Date.now()}@gmail.com`;
}

test.describe('auth pages', () => {
  test('register form blocks invalid input on /register', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Zarejestruj się' })).toBeVisible();

    await page.getByLabel('Email').fill('reader@');
    await expect(page.getByText('Wpisz poprawny adres e-mail.')).toBeVisible();

    await page.getByLabel('Hasło').fill('abc');
    await expect(page.getByText('Hasło musi mieć co najmniej 6 znaków.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zarejestruj się' })).toBeDisabled();
  });

  test('register flow works on /register', async ({ page }) => {
    const email = buildUniqueEmail();

    await page.route('**/auth/v1/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'test-user', email },
          session: null,
        }),
      });
    });

    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Zarejestruj się' })).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Hasło').fill('secret123');
    await expect(page.getByRole('button', { name: 'Zarejestruj się' })).toBeEnabled();
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page.getByRole('status')).toContainText(/Konto utworzone|Sprawdź skrzynkę|Możesz się zalogować/);
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
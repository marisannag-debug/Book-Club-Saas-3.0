import { expect, test } from '@playwright/test';

async function seedSupabaseSession(page: Parameters<typeof test>[0]['page']) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'sb-jobwaopukhkyxdwmlgto-auth-token',
      JSON.stringify({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: 'user-id-1', email: 'reader@example.com' },
      }),
    );
  });
}

test.describe('create club flow', () => {
  test('blocks invalid input on /club/create', async ({ page }) => {
    await seedSupabaseSession(page);

    await page.route('**/auth/v1/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-id-1', email: 'reader@example.com' },
        }),
      });
    });

    await page.route('**/rest/v1/clubs*', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'club-id-1',
          name: 'Sunset Readers',
        }),
      });
    });

    await page.goto('/club/create');

    await expect(page.getByRole('heading', { name: 'Tworzenie klubu' })).toBeVisible();

    await page.getByLabel('Nazwa klubu').fill('ab');
    await page.getByLabel('Nazwa klubu').blur();

    await expect(page.getByText('Nazwa klubu musi mieć co najmniej 3 znaki.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Utwórz klub' })).toBeDisabled();
  });

  test('creates a club and redirects to the club dashboard', async ({ page }) => {
    await seedSupabaseSession(page);

    await page.route('**/auth/v1/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-id-1', email: 'reader@example.com' },
        }),
      });
    });

    await page.route('**/rest/v1/clubs*', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'sunset-readers',
          name: 'Sunset Readers',
        }),
      });
    });

    await page.goto('/club/create');

    await page.getByLabel('Nazwa klubu').fill('Sunset Readers');
    await page.getByLabel('Opis klubu').fill('Wieczorne spotkania przy kawie.');
    await expect(page.getByRole('button', { name: 'Utwórz klub' })).toBeEnabled();

    await page.getByRole('button', { name: 'Utwórz klub' }).click();

    await expect(page).toHaveURL(/\/club\/sunset-readers$/);
    await expect(page.getByRole('heading', { name: 'Sunset Readers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nadchodzące spotkanie' })).toBeVisible();
  });
});
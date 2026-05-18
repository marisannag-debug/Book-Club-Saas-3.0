import { expect, test } from '@playwright/test';

test.describe('club dashboard', () => {
  test('renders the populated club dashboard', async ({ page }) => {
    await page.goto('/club/sunset-readers');

    await expect(page.getByRole('heading', { name: 'Sunset Readers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wybór książki na najbliższy miesiąc' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nadchodzące spotkanie' })).toBeVisible();
    await expect(page.getByText('Kod klubu')).toBeVisible();
  });

  test('shows empty states for a new club shell', async ({ page }) => {
    await page.goto('/club/empty-club');

    await expect(page.getByRole('heading', { name: 'Empty Club' })).toBeVisible();
    await expect(page.getByText(/Nie ma jeszcze aktywnego głosowania/i)).toBeVisible();
    await expect(page.getByText(/Nie ma jeszcze zaplanowanego spotkania/i)).toBeVisible();
    await expect(page.getByText(/W stage 10 dodamy zaproszenia linkiem/i)).toBeVisible();
  });
});
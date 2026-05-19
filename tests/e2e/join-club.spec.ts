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

test.describe('stage 9 join and invite flow', () => {
  test('joins a club from the invitation link', async ({ page }) => {
    await seedSupabaseSession(page);

    await page.route('**/api/club-invites/preview?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          invite: {
            clubId: 'club-id-1',
            clubName: 'Sunset Readers',
            invitedEmail: 'reader@example.com',
            inviteCode: 'BK-ABCDEF12',
            inviteUrl: 'http://localhost:3000/club/join?token=invite-token',
            expiresAt: '2026-05-25T00:00:00.000Z',
            status: 'pending',
          },
        }),
      });
    });

    await page.route('**/api/club-invites/redeem', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Dołączyłeś do klubu.',
          clubId: 'club-id-1',
        }),
      });
    });

    await page.goto('/club/join?token=invite-token');

    await expect(page.getByRole('heading', { name: 'Dołączanie do klubu' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sunset Readers' })).toBeVisible();

    await page.getByRole('button', { name: 'Dołącz z linku' }).click();

    await expect(page).toHaveURL(/\/club\/club-id-1$/);
  });

  test('generates an invite from the club invite page', async ({ page }) => {
    await seedSupabaseSession(page);

    await page.route('**/api/club-invites', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Zaproszenie zostało wysłane na e-mail i zapisane w systemie.',
          emailSent: true,
          invite: {
            clubId: 'sunset-readers',
            clubName: 'Sunset Readers',
            invitedEmail: 'reader@example.com',
            inviteCode: 'BK-ABCDEF12',
            inviteUrl: 'http://localhost:3000/club/join?token=invite-token',
            expiresAt: '2026-05-25T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/club/sunset-readers/invite');

    await expect(page.getByRole('heading', { name: 'Zaproszenia do klubu' })).toBeVisible();

    await page.getByLabel('Adres e-mail odbiorcy').fill('reader@example.com');
    await page.getByRole('button', { name: 'Wygeneruj zaproszenie' }).click();

    await expect(page.getByText('Zaproszenie gotowe')).toBeVisible();
    await expect(page.getByText('BK-ABCDEF12')).toBeVisible();
    await expect(page.getByText('http://localhost:3000/club/join?token=invite-token')).toBeVisible();
  });
});
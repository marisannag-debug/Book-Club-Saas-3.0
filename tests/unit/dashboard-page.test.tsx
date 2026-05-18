import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '../../app/dashboard/page';

const mockGetSession = vi.fn();
const mockLoadDashboardClubsByUserId = vi.fn();

vi.mock('../../lib/supabase.client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

vi.mock('../../lib/dashboard-clubs', () => ({
  loadDashboardClubsByUserId: (...args: unknown[]) => mockLoadDashboardClubsByUserId(...args),
}));

beforeEach(() => {
  mockGetSession.mockReset();
  mockLoadDashboardClubsByUserId.mockReset();
});

describe('DashboardPage', () => {
  it('loads the user clubs into the quick access list', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-id-1',
            email: 'reader@example.com',
          },
        },
      },
    });

    mockLoadDashboardClubsByUserId.mockResolvedValue({
      clubs: [
        { id: 'sunset-readers', name: 'Sunset Readers', description: 'Wieczorne spotkania.' },
        { id: 'morning-pages', name: 'Morning Pages' },
      ],
      error: null,
    });

    render(React.createElement(DashboardPage));

    await screen.findByRole('heading', { name: 'Twoje centrum BookClub Pro' });

    await waitFor(() => {
      expect(mockLoadDashboardClubsByUserId).toHaveBeenCalledWith('user-id-1');
    });

    expect(screen.getByRole('link', { name: /Sunset Readers/i })).toHaveAttribute('href', '/club/sunset-readers');
    expect(screen.getByRole('link', { name: /Morning Pages/i })).toHaveAttribute('href', '/club/morning-pages');
  });

  it('shows the empty state when there are no clubs', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-id-1',
            email: 'reader@example.com',
          },
        },
      },
    });

    mockLoadDashboardClubsByUserId.mockResolvedValue({
      clubs: [],
      error: null,
    });

    render(React.createElement(DashboardPage));

    await screen.findByRole('heading', { name: 'Twoje centrum BookClub Pro' });

    expect(
      screen.getByText('Nie masz jeszcze klubów. Zacznij od utworzenia nowego klubu albo dołączenia do istniejącego.'),
    ).toBeInTheDocument();
  });
});
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JoinClubForm from '../../app/components/club/JoinClubForm';

const mockReplace = vi.fn();
const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/club/join',
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'invite-token' : null),
    toString: () => 'token=invite-token',
  }),
}));

vi.mock('../../lib/supabase.browser', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

beforeEach(() => {
  mockReplace.mockReset();
  mockGetSession.mockReset();
  mockFetch.mockReset();
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: 'access-token',
      },
    },
  });
  vi.stubGlobal('fetch', mockFetch);
});

describe('JoinClubForm', () => {
  it('shows the code form and loads token preview', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
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

    render(<JoinClubForm />);

    expect(screen.getByText('Wpisz kod lub użyj linku z zaproszenia.')).toBeInTheDocument();
    expect(screen.getByLabelText('Kod zaproszenia')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sunset Readers' })).toBeInTheDocument();
    });
  });

  it('uses the manual code path when the button is pressed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
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

    render(<JoinClubForm />);

    fireEvent.change(screen.getByLabelText('Kod zaproszenia'), {
      target: { value: 'bk-abcdef12' },
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Kod zaproszenia')).toHaveValue('BK-ABCDEF12');
    });
  });
});
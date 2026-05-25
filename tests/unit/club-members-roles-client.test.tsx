import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClubMembersRolesClient from '../../app/components/club/ClubMembersRolesClient';

const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock('../../lib/supabase.browser', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

vi.mock('../../app/components/club/MembersRoleManager', () => ({
  default: ({ clubId, currentUserRole, members }: { clubId: string; currentUserRole: string; members: Array<{ displayName: string }> }) => (
    <div>
      <div>club:{clubId}</div>
      <div>role:{currentUserRole}</div>
      <div>members:{members.map((member) => member.displayName).join(', ')}</div>
    </div>
  ),
}));

beforeEach(() => {
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

describe('ClubMembersRolesClient', () => {
  it('loads the club roles via API and passes the real payload to the manager', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        club: {
          clubId: 'club-1',
          clubName: 'Sunset Readers',
          currentUserRole: 'host',
          members: [
            {
              userId: 'user-1',
              email: 'anna@example.com',
              displayName: 'Anna Kowalska',
              role: 'host',
              joinedAt: '2026-05-21',
              isCurrentUser: true,
              isCreator: true,
            },
          ],
        },
      }),
    });

    render(<ClubMembersRolesClient clubId="club-1" />);

    expect(screen.getByText('Wczytujemy członków klubu...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('club:club-1')).toBeInTheDocument();
    });

    expect(screen.getByText('role:host')).toBeInTheDocument();
    expect(screen.getByText('members:Anna Kowalska')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith('/api/club-roles?clubId=club-1', {
      headers: {
        Authorization: 'Bearer access-token',
      },
    });
  });
});
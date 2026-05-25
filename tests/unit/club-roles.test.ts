import { createClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listClubMembersWithRoles, updateClubMemberRole, validateClubRole } from '../../lib/db/roles';
import { resetSupabaseServerClientForTests } from '../../lib/supabase.server';

const mockGetUser = vi.fn();
const mockClubMaybeSingle = vi.fn();
const mockMembersOrder = vi.fn();
const mockMemberUpdate = vi.fn();
const mockMemberEqClub = vi.fn();
const mockMemberEqUser = vi.fn();
const mockMemberSelectAfterUpdate = vi.fn();
const mockMemberSingleAfterUpdate = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

function buildRequestClient() {
  return {
    auth: {
      getUser: mockGetUser,
    },
  };
}

function buildServerClient() {
  return {
    from: (table: string) => {
      if (table === 'clubs') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockClubMaybeSingle,
            }),
          }),
        };
      }

      if (table === 'club_members') {
        return {
          select: () => ({
            eq: () => ({
              order: mockMembersOrder,
            }),
          }),
          update: mockMemberUpdate.mockReturnValue({
            eq: mockMemberEqClub.mockReturnValue({
              eq: mockMemberEqUser.mockReturnValue({
                select: mockMemberSelectAfterUpdate.mockReturnValue({
                  single: mockMemberSingleAfterUpdate,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    },
  };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  resetSupabaseServerClientForTests();

  mockedCreateClient.mockReset();
  mockedCreateClient.mockImplementation((_url: string, key: string) => {
    return key === 'anon-key' ? (buildRequestClient() as never) : (buildServerClient() as never);
  });

  mockGetUser.mockReset();
  mockClubMaybeSingle.mockReset();
  mockMembersOrder.mockReset();
  mockMemberUpdate.mockClear();
  mockMemberEqClub.mockClear();
  mockMemberEqUser.mockClear();
  mockMemberSelectAfterUpdate.mockClear();
  mockMemberSingleAfterUpdate.mockReset();
});

describe('club role backend helpers', () => {
  it('validates supported roles', () => {
    expect(validateClubRole('host')).toBe('host');
    expect(validateClubRole('member')).toBe('member');
    expect(validateClubRole('admin')).toBeNull();
    expect(validateClubRole(undefined)).toBeNull();
  });

  it('lists members for a club host and treats the creator as host', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'creator-id', email: 'creator@example.com' } },
      error: null,
    });
    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: 'club-id-1',
        name: 'Sunset Readers',
        created_by: 'creator-id',
        created_at: '2026-05-21T10:00:00.000Z',
      },
      error: null,
    });
    mockMembersOrder.mockResolvedValue({
      data: [
        {
          id: 'member-id-1',
          club_id: 'club-id-1',
          user_id: 'member-id',
          role: 'member',
          joined_at: '2026-05-21T11:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await listClubMembersWithRoles('club-id-1', 'Bearer access-token');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.club.currentUserRole).toBe('host');
      expect(result.club.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: 'creator-id', role: 'host', isCreator: true }),
          expect.objectContaining({ userId: 'member-id', role: 'member' }),
        ]),
      );
    }
  });

  it('rejects role updates from a regular member', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'member-id', email: 'reader@example.com' } },
      error: null,
    });
    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: 'club-id-1',
        name: 'Sunset Readers',
        created_by: 'creator-id',
        created_at: '2026-05-21T10:00:00.000Z',
      },
      error: null,
    });
    mockMembersOrder.mockResolvedValue({
      data: [
        {
          id: 'member-id-1',
          club_id: 'club-id-1',
          user_id: 'member-id',
          role: 'member',
          joined_at: '2026-05-21T11:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await updateClubMemberRole({
      clubId: 'club-id-1',
      memberUserId: 'other-member-id',
      role: 'host',
      accessToken: 'Bearer access-token',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
    expect(mockMemberUpdate).not.toHaveBeenCalled();
  });

  it('updates a member role when requested by a host', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'creator-id', email: 'creator@example.com' } },
      error: null,
    });
    mockClubMaybeSingle.mockResolvedValue({
      data: {
        id: 'club-id-1',
        name: 'Sunset Readers',
        created_by: 'creator-id',
        created_at: '2026-05-21T10:00:00.000Z',
      },
      error: null,
    });
    mockMembersOrder.mockResolvedValue({
      data: [
        {
          id: 'member-id-1',
          club_id: 'club-id-1',
          user_id: 'member-id',
          role: 'member',
          joined_at: '2026-05-21T11:00:00.000Z',
        },
      ],
      error: null,
    });
    mockMemberSingleAfterUpdate.mockResolvedValue({
      data: {
        id: 'member-id-1',
        club_id: 'club-id-1',
        user_id: 'member-id',
        role: 'host',
        joined_at: '2026-05-21T11:00:00.000Z',
      },
      error: null,
    });

    const result = await updateClubMemberRole({
      clubId: 'club-id-1',
      memberUserId: 'member-id',
      role: 'host',
      accessToken: 'Bearer access-token',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.member.role).toBe('host');
    }
    expect(mockMemberUpdate).toHaveBeenCalledWith({ role: 'host' });
  });
});

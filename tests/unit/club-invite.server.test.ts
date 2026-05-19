import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createClubInvite, previewClubInviteByToken, redeemClubInvite } from '../../lib/club-invite.server';

const mockGetUser = vi.fn();
const mockClubMaybeSingle = vi.fn();
const mockInviteMaybeSingle = vi.fn();
const mockMembersUpsert = vi.fn();
const mockInviteUpdate = vi.fn();
const mockInviteEq = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

function buildMockClient() {
  return {
    auth: {
      getUser: mockGetUser,
    },
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

      if (table === 'club_invites') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockInviteMaybeSingle,
            }),
          }),
          insert: () => ({
            select: () => ({
              single: mockInviteMaybeSingle,
            }),
          }),
          update: () => ({
            eq: mockInviteEq,
          }),
        };
      }

      if (table === 'club_members') {
        return {
          upsert: mockMembersUpsert,
        };
      }

      return {};
    },
  } as never;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  mockedCreateClient.mockReset();
  mockedCreateClient.mockReturnValue(buildMockClient());
  mockGetUser.mockReset();
  mockClubMaybeSingle.mockReset();
  mockInviteMaybeSingle.mockReset();
  mockMembersUpsert.mockReset();
  mockInviteUpdate.mockReset();
  mockInviteEq.mockReset();

  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-id-1', email: 'reader@example.com' } },
    error: null,
  });
});

describe('createClubInvite', () => {
  it('creates an invite for the club owner', async () => {
    mockClubMaybeSingle.mockResolvedValue({
      data: { id: 'club-id-1', name: 'Sunset Readers', created_by: 'user-id-1' },
      error: null,
    });

    mockInviteMaybeSingle.mockResolvedValue({
      data: {
        id: 'invite-id-1',
        club_id: 'club-id-1',
        invited_email: 'reader@example.com',
        invited_by: 'user-id-1',
        invite_code: 'BK-ABCDEF12',
        invite_token_hash: 'hash',
        status: 'pending',
        expires_at: '2026-05-25T00:00:00.000Z',
        accepted_at: null,
        accepted_by: null,
      },
      error: null,
    });

    const result = await createClubInvite({
      clubId: 'club-id-1',
      invitedEmail: 'reader@example.com',
      accessToken: 'Bearer access-token',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invite.clubId).toBe('club-id-1');
      expect(result.invite.clubName).toBe('Sunset Readers');
      expect(result.invite.inviteUrl).toContain('/club/join?token=');
    }
    expect(mockedCreateClient).toHaveBeenCalled();
  });

  it('rejects invite generation for non-owners', async () => {
    mockClubMaybeSingle.mockResolvedValue({
      data: { id: 'club-id-1', name: 'Sunset Readers', created_by: 'other-user' },
      error: null,
    });

    const result = await createClubInvite({
      clubId: 'club-id-1',
      accessToken: 'Bearer access-token',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });
});

describe('previewClubInviteByToken', () => {
  it('returns preview data for a valid token', async () => {
    mockInviteMaybeSingle.mockResolvedValue({
      data: {
        id: 'invite-id-1',
        club_id: 'club-id-1',
        invited_email: 'reader@example.com',
        invited_by: 'user-id-1',
        invite_code: 'BK-ABCDEF12',
        invite_token_hash: 'hash',
        status: 'pending',
        expires_at: '2026-05-25T00:00:00.000Z',
        accepted_at: null,
        accepted_by: null,
      },
      error: null,
    });

    mockClubMaybeSingle.mockResolvedValue({
      data: { id: 'club-id-1', name: 'Sunset Readers', created_by: 'user-id-1' },
      error: null,
    });

    const result = await previewClubInviteByToken('token-value');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invite.clubName).toBe('Sunset Readers');
    }
  });
});

describe('redeemClubInvite', () => {
  it('redeems an invite and creates membership', async () => {
    mockInviteMaybeSingle.mockResolvedValue({
      data: {
        id: 'invite-id-1',
        club_id: 'club-id-1',
        invited_email: 'reader@example.com',
        invited_by: 'user-id-1',
        invite_code: 'BK-ABCDEF12',
        invite_token_hash: 'hash',
        status: 'pending',
        expires_at: '2026-05-25T00:00:00.000Z',
        accepted_at: null,
        accepted_by: null,
      },
      error: null,
    });

    mockMembersUpsert.mockResolvedValue({ error: null });
    mockInviteEq.mockResolvedValue({ error: null });

    const result = await redeemClubInvite({
      inviteCode: 'bk-abcdef12',
      accessToken: 'Bearer access-token',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.clubId).toBe('club-id-1');
    }
    expect(mockMembersUpsert).toHaveBeenCalled();
  });
});
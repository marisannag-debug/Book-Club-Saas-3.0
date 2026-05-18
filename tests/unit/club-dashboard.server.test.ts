import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildClubDashboardFallback, getClubDashboardById } from '../../lib/club-dashboard.server';
import { getSupabaseServerClient } from '../../lib/supabase.server';

vi.mock('../../lib/supabase.server', () => ({
  getSupabaseServerClient: vi.fn(),
}));

const mockedGetSupabaseServerClient = vi.mocked(getSupabaseServerClient);

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

beforeEach(() => {
  mockedGetSupabaseServerClient.mockReset();
  mockMaybeSingle.mockReset();
  mockEq.mockReset();
  mockSelect.mockReset();
  mockFrom.mockReset();

  mockedGetSupabaseServerClient.mockReturnValue({
    from: mockFrom,
  } as never);
});

describe('club dashboard server helper', () => {
  it('returns a populated read model for a standard club id', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'sunset-readers',
        name: 'Sunset Readers',
        description: 'Spotkania przy kawie i książkach.',
      },
      error: null,
    });

    await expect(getClubDashboardById('sunset-readers')).resolves.toMatchObject({
      id: 'sunset-readers',
      name: 'Sunset Readers',
      description: 'Spotkania przy kawie i książkach.',
      memberCount: expect.any(Number),
      activeVoting: expect.objectContaining({
        title: 'Wybór książki na najbliższy miesiąc',
      }),
      nextMeeting: expect.objectContaining({
        title: 'Nadchodzące spotkanie',
      }),
    });
  });

  it('returns empty dashboard states for a new club shell', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(getClubDashboardById('empty-club')).resolves.toMatchObject({
      id: 'empty-club',
      name: 'Empty Club',
      memberCount: 0,
      activeVoting: null,
      nextMeeting: null,
      invite: expect.objectContaining({
        status: 'Przygotowanie',
      }),
    });
  });

  it('throws when the club id is empty', async () => {
    await expect(getClubDashboardById('   ')).rejects.toThrow('Brakuje identyfikatora klubu.');
  });

  it('builds the same fallback model synchronously for component reuse', () => {
    expect(buildClubDashboardFallback('demo-club')).toMatchObject({
      id: 'demo-club',
      name: 'Demo Club',
    });
  });

  it('falls back to the demo model when Supabase is unavailable', async () => {
    mockedGetSupabaseServerClient.mockImplementation(() => {
      throw new Error('missing config');
    });

    await expect(getClubDashboardById('demo-club')).resolves.toMatchObject({
      id: 'demo-club',
      name: 'Demo Club',
    });
  });
});
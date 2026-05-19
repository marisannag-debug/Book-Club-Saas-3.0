import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDashboardClubsByUserId } from '../../lib/dashboard-clubs';
import { getSupabaseBrowserClient } from '../../lib/supabase.browser';

vi.mock('../../lib/supabase.browser', () => ({
  getSupabaseBrowserClient: vi.fn(),
}));

const mockedGetSupabaseBrowserClient = vi.mocked(getSupabaseBrowserClient);
const mockOrder = vi.fn();
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

beforeEach(() => {
  mockedGetSupabaseBrowserClient.mockReset();
  mockOrder.mockReset();
  mockSelect.mockClear();
  mockFrom.mockClear();

  mockedGetSupabaseBrowserClient.mockReturnValue({
    from: mockFrom,
  } as never);
});

describe('dashboard clubs helper', () => {
  it('loads clubs for the current user and maps descriptions', async () => {
    mockOrder.mockResolvedValue({
      data: [
        { id: 'alpha', name: 'Alpha Club', description: 'Wieczorne dyskusje.' },
        { id: 'beta', name: 'Beta Club', description: null },
      ],
      error: null,
    });

    await expect(loadDashboardClubsByUserId('user-id-1')).resolves.toEqual({
      clubs: [
        { id: 'alpha', name: 'Alpha Club', description: 'Wieczorne dyskusje.' },
        { id: 'beta', name: 'Beta Club', description: undefined },
      ],
      error: null,
    });

    expect(mockFrom).toHaveBeenCalledWith('clubs');
    expect(mockSelect).toHaveBeenCalledWith('id, name, description');
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('returns an error message when Supabase query fails', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'relation "clubs" does not exist' },
    });

    await expect(loadDashboardClubsByUserId('user-id-1')).resolves.toEqual({
      clubs: [],
      error: 'Nie udało się wczytać listy klubów. Spróbuj odświeżyć dashboard lub wróć później.',
    });
  });
});
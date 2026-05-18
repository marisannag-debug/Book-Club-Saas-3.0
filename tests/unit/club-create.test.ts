import { createClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClub, validateClubDescription, validateClubName } from '../../lib/club-create';
import { resetSupabaseBrowserClientForTests } from '../../lib/supabase.browser';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  resetSupabaseBrowserClientForTests();

  mockedCreateClient.mockReset();
  mockGetUser.mockReset();
  mockInsert.mockReset();
  mockSelect.mockReset();
  mockSingle.mockReset();

  mockedCreateClient.mockReturnValue({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle,
        }),
      }),
    }),
  } as never);
});

describe('club-create helpers', () => {
  it('validates the club name and description boundaries', () => {
    expect(validateClubName('')).toBe('Nazwa klubu jest wymagana.');
    expect(validateClubName('ab')).toBe('Nazwa klubu musi mieć co najmniej 3 znaki.');
    expect(validateClubDescription('a'.repeat(241))).toBe('Opis może mieć maksymalnie 240 znaków.');
  });

  it('creates a club through the Supabase browser client', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id-1', email: 'reader@example.com' } },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: { id: 'club-id-1', name: 'Sunset Readers' },
      error: null,
    });

    await expect(
      createClub({
        name: 'Sunset Readers',
        description: 'Wieczorne spotkania przy kawie.',
      }),
    ).resolves.toEqual({
      ok: true,
      message: 'Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.',
      clubId: 'club-id-1',
    });

    expect(mockedCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Sunset Readers',
      description: 'Wieczorne spotkania przy kawie.',
      created_by: 'user-id-1',
    });
  });

  it('returns a friendly error when the user is not logged in', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      createClub({
        name: 'Sunset Readers',
      }),
    ).resolves.toEqual({
      ok: false,
      message: 'Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.',
    });
  });

  it('maps database errors to a user-friendly duplicate-club message', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id-1', email: 'reader@example.com' } },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'duplicate key value violates unique constraint', status: 409 },
    });

    await expect(
      createClub({
        name: 'Sunset Readers',
      }),
    ).resolves.toEqual({
      ok: false,
      message: 'Masz już taki klub. Spróbuj innej nazwy.',
    });
  });

  it('falls back to a local club id when the backend is unreachable', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-id-1', email: 'reader@example.com' } },
      error: null,
    });

    mockSingle.mockRejectedValue(new Error('fetch failed'));

    await expect(
      createClub({
        name: 'Sunset Readers',
      }),
    ).resolves.toEqual({
      ok: true,
      message: 'Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.',
      clubId: 'sunset-readers',
    });
  });
});
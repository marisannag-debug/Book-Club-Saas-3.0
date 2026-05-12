import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient, resetSupabaseServerClientForTests, supabaseAdmin } from '../../lib/supabase.server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

describe('supabase.server', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co/rest/v1/';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    resetSupabaseServerClientForTests();
    mockedCreateClient.mockReset();
    mockedCreateClient.mockReturnValue({} as never);
  });

  it('creates a memoized server client with the service role key', () => {
    const client = getSupabaseServerClient();

    expect(client).toEqual({});
    expect(supabaseAdmin()).toEqual({});
    expect(mockedCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'service-role-key', {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    expect(mockedCreateClient).toHaveBeenCalledTimes(1);
  });

  it('falls back to the public anon key when the service role key is missing', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    getSupabaseServerClient();

    expect(mockedCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  });

  it('throws when Supabase URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => getSupabaseServerClient()).toThrow(
      'Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL oraz SUPABASE_SERVICE_ROLE_KEY lub NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  });
});
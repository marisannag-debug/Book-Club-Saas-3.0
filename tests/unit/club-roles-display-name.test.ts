import { describe, expect, it } from 'vitest';
import { formatMemberName } from '../../lib/db/roles';

describe('formatMemberName', () => {
  it('returns the same label for members and the creator', () => {
    expect(formatMemberName('user-member-1')).toBe('user-mem');
    expect(formatMemberName('user-host-1')).toBe('user-hos');
  });
});
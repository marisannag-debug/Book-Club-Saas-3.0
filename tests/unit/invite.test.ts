import { describe, expect, it } from 'vitest';
import {
  buildInviteCode,
  buildInviteExpiresAt,
  buildInviteToken,
  buildInviteUrl,
  formatInviteCodeForDisplay,
  hashInviteToken,
  normalizeInviteCode,
  normalizeInviteEmail,
} from '../../lib/invite';

describe('invite helpers', () => {
  it('normalizes invite codes and emails', () => {
    expect(normalizeInviteCode(' bk-1a2b 3c4d ')).toBe('BK1A2B3C4D');
    expect(formatInviteCodeForDisplay(' bk-1a2b 3c4d ')).toBe('BK-1A2B3C4D');
    expect(normalizeInviteEmail(' Reader@Example.com ')).toBe('reader@example.com');
    expect(normalizeInviteEmail('   ')).toBeNull();
  });

  it('builds token-based invite metadata', () => {
    const token = buildInviteToken();
    const code = buildInviteCode();

    expect(token).toHaveLength(43);
    expect(code).toMatch(/^BK-[A-F0-9]{8}$/);
    expect(buildInviteUrl(token)).toContain('/club/join?token=');
    expect(hashInviteToken(token)).toHaveLength(64);
  });

  it('builds an expiry timestamp in the future', () => {
    const expiresAt = buildInviteExpiresAt(new Date('2026-05-18T00:00:00.000Z'));

    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.parse('2026-05-18T00:00:00.000Z'));
  });
});
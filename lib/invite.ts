import { createHash, randomBytes } from "node:crypto";

const DEFAULT_INVITE_TOKEN_TTL_HOURS = 168;

export type ClubInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type ClubInvitePreview = {
  clubId: string;
  clubName: string;
  invitedEmail: string | null;
  inviteCode: string;
  inviteUrl: string;
  expiresAt: string;
  status: ClubInviteStatus;
};

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatInviteCodeForDisplay(value: string) {
  const normalizedValue = normalizeInviteCode(value);

  if (normalizedValue.startsWith("BK") && normalizedValue.length > 2) {
    return `BK-${normalizedValue.slice(2)}`;
  }

  return normalizedValue;
}

export function normalizeInviteEmail(value: string | null | undefined) {
  const normalizedValue = value?.trim().toLowerCase() ?? "";

  return normalizedValue || null;
}

export function buildInviteCode() {
  return `BK-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function buildInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export function getInviteTokenTtlHours() {
  const rawValue = process.env.INVITE_TOKEN_TTL_HOURS?.trim();
  const parsedValue = rawValue ? Number(rawValue) : DEFAULT_INVITE_TOKEN_TTL_HOURS;

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_INVITE_TOKEN_TTL_HOURS;
  }

  return parsedValue;
}

export function buildInviteExpiresAt(baseDate = new Date()) {
  return new Date(baseDate.getTime() + getInviteTokenTtlHours() * 60 * 60 * 1000).toISOString();
}

export function buildInviteUrl(token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

  return `${normalizedSiteUrl}/club/join?token=${encodeURIComponent(token)}`;
}

export function buildInviteMessage(invite: ClubInvitePreview) {
  return `Zaproszenie do klubu ${invite.clubName} jest gotowe. Kod: ${invite.inviteCode}. Link: ${invite.inviteUrl}`;
}
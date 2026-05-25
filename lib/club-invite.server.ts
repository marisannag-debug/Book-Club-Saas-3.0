import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabase.server";
import type { SupabaseAppClient, SupabaseDatabase } from "./supabase.types";
import {
  buildInviteCode,
  buildInviteExpiresAt,
  buildInviteToken,
  buildInviteUrl,
  formatInviteCodeForDisplay,
  hashInviteToken,
  normalizeInviteCode,
  normalizeInviteEmail,
  type ClubInvitePreview,
} from "./invite";

type SupabaseAuthResult = {
  data: {
    user: {
      id: string;
      email?: string | null;
    } | null;
  };
  error: { message: string } | null;
};

type ClubInviteRow = {
  id: string;
  club_id: string;
  invited_email: string | null;
  invited_by: string;
  invite_code: string;
  invite_token_hash: string;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
};

type ClubRow = {
  id: string;
  name: string;
  created_by: string;
};

export type CreateClubInviteInput = {
  clubId: string;
  invitedEmail?: string;
  accessToken: string;
};

export type CreateClubInviteResult =
  | {
      ok: true;
      status: 201;
      message: string;
      invite: ClubInvitePreview;
      emailSent: boolean;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type PreviewClubInviteResult =
  | {
      ok: true;
      status: 200;
      invite: ClubInvitePreview;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export type RedeemClubInviteInput = {
  inviteCode?: string;
  inviteToken?: string;
  accessToken: string;
};

export type RedeemClubInviteResult =
  | {
      ok: true;
      status: 200;
      message: string;
      clubId: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

function extractAccessToken(accessToken: string) {
  return accessToken.trim().replace(/^Bearer\s+/i, "");
}

function getSupabaseRequestConfig(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const normalizedAccessToken = extractAccessToken(accessToken);

  if (!supabaseUrl) {
    throw new Error(
      "Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL oraz NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!supabaseAnonKey) {
    throw new Error("Brakuje konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const normalizedSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return {
    supabaseAnonKey,
    supabaseUrl: normalizedSupabaseUrl,
    accessToken: normalizedAccessToken,
  };
}

function createRequestSupabaseClient(accessToken: string) {
  const { supabaseAnonKey, supabaseUrl, accessToken: normalizedAccessToken } = getSupabaseRequestConfig(accessToken);

  return createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${normalizedAccessToken}`,
      },
    },
  });
}

function normalizeInviteRecord(invite: ClubInviteRow, club: ClubRow, inviteUrl: string): ClubInvitePreview {
  return {
    clubId: club.id,
    clubName: club.name,
    invitedEmail: invite.invited_email,
    inviteCode: formatInviteCodeForDisplay(invite.invite_code),
    inviteUrl,
    expiresAt: invite.expires_at,
    status: invite.status as ClubInvitePreview["status"],
  };
}

function mapInviteDatabaseError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("duplicate") || normalizedMessage.includes("unique")) {
    return "Zaproszenie z takim kodem już istnieje. Spróbuj ponownie.";
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("forbidden")) {
    return "Nie masz uprawnień do wykonania tej operacji.";
  }

  return "Nie udało się przetworzyć zaproszenia. Spróbuj ponownie.";
}

async function getAuthenticatedUser(accessToken: string) {
  const supabase = createRequestSupabaseClient(accessToken);
  const response = (await supabase.auth.getUser()) as SupabaseAuthResult;

  if (response.error || !response.data.user?.id) {
    return null;
  }

  return response.data.user;
}

async function findClubByIdForClient(supabase: SupabaseAppClient, clubId: string) {
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, created_by")
    .eq("id", clubId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubRow;
}

async function findInviteByCodeForClient(supabase: SupabaseAppClient, inviteCode: string) {
  const { data, error } = await supabase
    .from("club_invites")
    .select("id, club_id, invited_email, invited_by, invite_code, invite_token_hash, status, expires_at, accepted_at, accepted_by")
    .eq("invite_code", normalizeInviteCode(inviteCode))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubInviteRow;
}

async function findInviteByTokenForClient(supabase: SupabaseAppClient, inviteToken: string) {
  const { data, error } = await supabase
    .from("club_invites")
    .select("id, club_id, invited_email, invited_by, invite_code, invite_token_hash, status, expires_at, accepted_at, accepted_by")
    .eq("invite_token_hash", hashInviteToken(inviteToken))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubInviteRow;
}

async function sendInviteEmail({
  invite,
  recipientEmail,
}: {
  invite: ClubInvitePreview;
  recipientEmail: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from || !recipientEmail) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `Zaproszenie do klubu ${invite.clubName}`,
      text: `Dołącz do klubu ${invite.clubName}\n\nKod: ${invite.inviteCode}\nLink: ${invite.inviteUrl}\nWażne do: ${invite.expiresAt}`,
    }),
  });

  return response.ok;
}

export async function createClubInvite({ clubId, invitedEmail, accessToken }: CreateClubInviteInput): Promise<CreateClubInviteResult> {
  const user = await getAuthenticatedUser(accessToken);

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "Nie masz aktywnej sesji. Zaloguj się ponownie i spróbuj jeszcze raz.",
    };
  }

  const normalizedClubId = clubId.trim();
  if (!normalizedClubId) {
    return {
      ok: false,
      status: 400,
      message: "Brakuje identyfikatora klubu.",
    };
  }

  const supabase = createRequestSupabaseClient(accessToken);
  const club = await findClubByIdForClient(supabase, normalizedClubId);

  if (!club || club.created_by !== user.id) {
    return {
      ok: false,
      status: 403,
      message: "Nie masz uprawnień do tworzenia zaproszeń dla tego klubu.",
    };
  }

  const normalizedEmail = normalizeInviteEmail(invitedEmail);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const inviteToken = buildInviteToken();
    const inviteCode = buildInviteCode();
    const inviteUrl = buildInviteUrl(inviteToken);
    const expiresAt = buildInviteExpiresAt();
    const inviteTokenHash = hashInviteToken(inviteToken);

    const { data, error } = await supabase
      .from("club_invites")
      .insert({
        club_id: club.id,
        invited_email: normalizedEmail,
        invited_by: user.id,
        invite_code: normalizeInviteCode(inviteCode),
        invite_token_hash: inviteTokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id, club_id, invited_email, invited_by, invite_code, invite_token_hash, status, expires_at, accepted_at, accepted_by")
      .single();

    if (error || !data) {
      const normalizedMessage = error?.message.toLowerCase() ?? "";

      if (normalizedMessage.includes("duplicate") || normalizedMessage.includes("unique")) {
        continue;
      }

      return {
        ok: false,
        status: 400,
        message: mapInviteDatabaseError(error?.message ?? "Unknown invite error"),
      };
    }

    const invite = normalizeInviteRecord(data as ClubInviteRow, club, inviteUrl);
    const emailSent = await sendInviteEmail({ invite, recipientEmail: normalizedEmail });

    return {
      ok: true,
      status: 201,
      message: emailSent
        ? "Zaproszenie zostało wysłane na e-mail i zapisane w systemie."
        : "Zaproszenie zostało przygotowane. Link i kod są gotowe do wysłania.",
      invite: {
        ...invite,
      },
      emailSent,
    };
  }

  return {
    ok: false,
    status: 500,
    message: "Nie udało się wygenerować zaproszenia. Spróbuj ponownie.",
  };
}

export async function previewClubInviteByToken(inviteToken: string): Promise<PreviewClubInviteResult> {
  const normalizedToken = inviteToken.trim();

  if (!normalizedToken) {
    return {
      ok: false,
      status: 400,
      message: "Brakuje tokenu zaproszenia.",
    };
  }

  const supabase = getSupabaseServerClient();
  const invite = await findInviteByTokenForClient(supabase, normalizedToken);

  if (!invite) {
    return {
      ok: false,
      status: 404,
      message: "Nie znaleziono zaproszenia albo zostało ono unieważnione.",
    };
  }

  if (invite.status !== "pending") {
    return {
      ok: false,
      status: 409,
      message: "To zaproszenie zostało już użyte lub unieważnione.",
    };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      status: 410,
      message: "To zaproszenie wygasło.",
    };
  }

  const club = await findClubByIdForClient(supabase, invite.club_id);

  if (!club) {
    return {
      ok: false,
      status: 404,
      message: "Nie znaleziono klubu przypisanego do tego zaproszenia.",
    };
  }

  return {
    ok: true,
    status: 200,
    invite: normalizeInviteRecord(invite, club, buildInviteUrl(normalizedToken)),
  };
}

export async function redeemClubInvite({ inviteCode, inviteToken, accessToken }: RedeemClubInviteInput): Promise<RedeemClubInviteResult> {
  const user = await getAuthenticatedUser(accessToken);

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "Zaloguj się, aby dołączyć do klubu.",
    };
  }

  const code = inviteCode ? normalizeInviteCode(inviteCode) : "";
  const token = inviteToken?.trim() ?? "";

  if (!code && !token) {
    return {
      ok: false,
      status: 400,
      message: "Podaj kod lub otwórz link z zaproszeniem.",
    };
  }

  const supabase = getSupabaseServerClient();
  const invite = code ? await findInviteByCodeForClient(supabase, code) : await findInviteByTokenForClient(supabase, token);

  if (!invite) {
    return {
      ok: false,
      status: 404,
      message: "Nie znaleziono zaproszenia. Sprawdź kod i spróbuj ponownie.",
    };
  }

  if (invite.status !== "pending") {
    return {
      ok: false,
      status: 409,
      message: "To zaproszenie zostało już użyte lub unieważnione.",
    };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      status: 410,
      message: "To zaproszenie wygasło.",
    };
  }

  if (invite.invited_email && normalizeInviteEmail(invite.invited_email) !== normalizeInviteEmail(user.email ?? null)) {
    return {
      ok: false,
      status: 403,
      message: "To zaproszenie jest przypisane do innego adresu e-mail.",
    };
  }

  const { error: membershipError } = await supabase
    .from("club_members")
    .upsert(
      {
        club_id: invite.club_id,
        user_id: user.id,
        joined_via_invite_id: invite.id,
        membership_status: "active",
      },
      {
        onConflict: "club_id,user_id",
      },
    );

  if (membershipError) {
    return {
      ok: false,
      status: 400,
      message: mapInviteDatabaseError(membershipError.message),
    };
  }

  const { error: updateError } = await supabase
    .from("club_invites")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq("id", invite.id);

  if (updateError) {
    return {
      ok: false,
      status: 400,
      message: mapInviteDatabaseError(updateError.message),
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Dołączyłeś do klubu.",
    clubId: invite.club_id,
  };
}

import { NextResponse } from "next/server";
import { redeemClubInvite } from "../../../../lib/club-invite.server";

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inviteCode?: string;
      inviteToken?: string;
    };

    const result = await redeemClubInvite({
      inviteCode: body.inviteCode,
      inviteToken: body.inviteToken,
      accessToken: getAccessToken(request),
    });

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Nie udało się dołączyć do klubu. Spróbuj ponownie.",
      },
      { status: 500 },
    );
  }
}
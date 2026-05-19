import { NextResponse } from "next/server";
import { createClubInvite } from "../../../lib/club-invite.server";

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clubId?: string;
      invitedEmail?: string;
    };

    const result = await createClubInvite({
      clubId: body.clubId ?? "",
      invitedEmail: body.invitedEmail,
      accessToken: getAccessToken(request),
    });

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Nie udało się utworzyć zaproszenia. Spróbuj ponownie.",
      },
      { status: 500 },
    );
  }
}
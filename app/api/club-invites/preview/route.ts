import { NextResponse } from "next/server";
import { previewClubInviteByToken } from "../../../../lib/club-invite.server";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const result = await previewClubInviteByToken(token);

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Nie udało się wczytać zaproszenia.",
      },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import { listClubMembersWithRoles, updateClubMemberRole } from "../../../lib/db/roles";

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

export async function GET(request: Request) {
  try {
    const clubId = new URL(request.url).searchParams.get("clubId") ?? "";
    const result = await listClubMembersWithRoles(clubId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się wczytać ról klubu.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      clubId?: string;
      userId?: string;
      role?: unknown;
    };

    const result = await updateClubMemberRole({
      clubId: body.clubId ?? "",
      memberUserId: body.userId ?? "",
      role: body.role,
      accessToken: getAccessToken(request),
    });

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się zmienić roli członka.",
      },
      { status: 500 },
    );
  }
}

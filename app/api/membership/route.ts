import { NextResponse } from "next/server";
import { membershipActionSchema } from "../../../lib/membership";
import { acceptMembership, getMembershipDetails, leaveClub, renameMembership } from "../../../lib/db/membership";

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

export async function GET(request: Request) {
  try {
    const clubId = new URL(request.url).searchParams.get("clubId") ?? "";
    const result = await getMembershipDetails(clubId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się wczytać członkostwa.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = membershipActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane członkostwa.",
        },
        { status: 400 },
      );
    }

    const accessToken = getAccessToken(request);
    const clubId = parsed.data.clubId;

    if (parsed.data.action === "accept") {
      const result = await acceptMembership(clubId, accessToken);
      return NextResponse.json(result, { status: result.status });
    }

    if (parsed.data.action === "leave") {
      const result = await leaveClub(clubId, accessToken);
      return NextResponse.json(result, { status: result.status });
    }

    const result = await renameMembership(clubId, parsed.data.displayName, accessToken);
    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się zapisać zmian członkostwa.",
      },
      { status: 500 },
    );
  }
}

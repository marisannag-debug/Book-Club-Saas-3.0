import { NextResponse } from "next/server";
import { ensurePlannerMeetingForClub } from "../../../lib/db/meetings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

async function readPayload(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return null;
  }

  return body as { clubId?: string };
}

export async function POST(request: Request) {
  try {
    const payload = await readPayload(request);

    if (!payload?.clubId?.trim()) {
      return NextResponse.json({ ok: false, status: 400, message: "Brakuje clubId." }, { status: 400 });
    }

    const meeting = await ensurePlannerMeetingForClub(payload.clubId, getAccessToken(request));

    return NextResponse.json({ ok: true, meeting }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      const status = Number((error as { status?: number }).status) || 500;
      return NextResponse.json(
        { ok: false, status, message: error.message || "Nie udało się wczytać planera spotkania." },
        { status },
      );
    }

    return NextResponse.json({ ok: false, status: 500, message: "Nie udało się wczytać planera spotkania." }, { status: 500 });
  }
}

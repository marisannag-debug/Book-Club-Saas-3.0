import { NextResponse } from "next/server";
import { createMeetingVote, deleteMeetingVote } from "../../../lib/db/meetings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

async function readPayload(request: Request) {
  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object") return null;
  return body as { meetingId?: string; slotId?: string };
}

export async function POST(request: Request) {
  try {
    const payload = await readPayload(request);

    if (!payload || !payload.meetingId || !payload.slotId) {
      return NextResponse.json({ ok: false, status: 400, message: "Brak wymaganych pól: meetingId lub slotId." }, { status: 400 });
    }

    const result = await createMeetingVote(payload.meetingId, payload.slotId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch (err) {
    return NextResponse.json({ ok: false, status: 500, message: "Nie udało się zapisać głosu." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const meetingId = url.searchParams.get("meetingId") ?? "";

    if (!meetingId.trim()) {
      const payload = await readPayload(request);
      if (!payload || !payload.meetingId) {
        return NextResponse.json({ ok: false, status: 400, message: "Brakuje meetingId." }, { status: 400 });
      }
      const result = await deleteMeetingVote(payload.meetingId, getAccessToken(request));
      return NextResponse.json(result, { status: result.status });
    }

    const result = await deleteMeetingVote(meetingId, getAccessToken(request));
    return NextResponse.json(result, { status: result.status });
  } catch (err) {
    return NextResponse.json({ ok: false, status: 500, message: "Nie udało się usunąć głosu." }, { status: 500 });
  }
}

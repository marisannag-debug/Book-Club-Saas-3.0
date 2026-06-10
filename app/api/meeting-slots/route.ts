import { NextResponse } from "next/server";
import { createMeetingSlot, deleteMeetingSlot } from "../../../lib/db/meetings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

async function readSlotPayload(request: Request) {
  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object") return null;
  return body as { meetingId?: string; startAt?: string; endAt?: string | null; label?: string | null; slotId?: string };
}

export async function POST(request: Request) {
  try {
    const payload = await readSlotPayload(request);

    if (!payload || !payload.meetingId || !payload.startAt) {
      return NextResponse.json({ ok: false, status: 400, message: "Brak wymaganych pól: meetingId lub startAt." }, { status: 400 });
    }

    const result = await createMeetingSlot(payload.meetingId, payload.startAt, payload.endAt ?? null, payload.label ?? null, getAccessToken(request));

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status ?? 400 });
    }

    return NextResponse.json({ ok: true, slotId: result.slotId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, status: 500, message: "Nie udało się dodać propozycji." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const slotId = url.searchParams.get("slotId") ?? "";

    if (!slotId.trim()) {
      // try body
      const payload = await readSlotPayload(request);
      if (!payload || !payload.slotId) {
        return NextResponse.json({ ok: false, status: 400, message: "Brakuje slotId." }, { status: 400 });
      }
      const result = await deleteMeetingSlot(payload.slotId, getAccessToken(request));
      return NextResponse.json(result, { status: result.status ?? 200 });
    }

    const result = await deleteMeetingSlot(slotId, getAccessToken(request));
    return NextResponse.json(result, { status: result.status ?? 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, status: 500, message: "Nie udało się usunąć propozycji." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createProposalVote, deleteProposalVote } from "../../../lib/db/votes";
import { voteProposalSchema } from "../../../lib/voting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

async function readProposalIdFromRequest(request: Request) {
  const queryProposalId = new URL(request.url).searchParams.get("proposalId") ?? "";

  if (queryProposalId.trim()) {
    return queryProposalId.trim();
  }

  const bodyText = await request.text();

  if (!bodyText.trim()) {
    return "";
  }

  try {
    const body = JSON.parse(bodyText) as unknown;
    const parsed = voteProposalSchema.safeParse(body);

    if (parsed.success) {
      return parsed.data.proposalId;
    }
  } catch {
    return "";
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = voteProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          status: 400,
          message: parsed.error.issues[0]?.message ?? "Nieprawidłowy identyfikator propozycji.",
        },
        { status: 400 },
      );
    }

    const result = await createProposalVote(parsed.data.proposalId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się zapisać głosu.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const proposalId = await readProposalIdFromRequest(request);
    const result = await deleteProposalVote(proposalId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się usunąć głosu.",
      },
      { status: 500 },
    );
  }
}
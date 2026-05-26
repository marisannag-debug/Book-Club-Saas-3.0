import { NextResponse } from "next/server";
import { deleteBookProposal, updateBookProposal } from "../../../../lib/db/book-proposals";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

function readOptionalFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

async function parseUpdatePayload(request: Request, proposalId: string) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const coverImageFile = formData.get("coverImageFile") ?? formData.get("proposal-cover-image-file");

    if (coverImageFile instanceof File) {
      const bytes = new Uint8Array(await coverImageFile.arrayBuffer());
      const base64 = Buffer.from(bytes).toString("base64");

      return {
        proposalId,
        title: readOptionalFormValue(formData, "title"),
        author: readOptionalFormValue(formData, "author"),
        description: readOptionalFormValue(formData, "description"),
        coverImageUrl: `data:${coverImageFile.type || "application/octet-stream"};base64,${base64}`,
        coverImageName: coverImageFile.name,
      };
    }

    return {
      proposalId,
      title: readOptionalFormValue(formData, "title"),
      author: readOptionalFormValue(formData, "author"),
      description: readOptionalFormValue(formData, "description"),
      coverImageUrl: readOptionalFormValue(formData, "coverImageUrl"),
      coverImageName: readOptionalFormValue(formData, "coverImageName"),
    };
  }

  const body = (await request.json()) as {
    title?: string;
    author?: string;
    description?: string | null;
    coverImageUrl?: string | null;
    coverImageName?: string | null;
  };

  return {
    proposalId,
    title: body.title,
    author: body.author,
    description: body.description ?? undefined,
    coverImageUrl: body.coverImageUrl ?? undefined,
    coverImageName: body.coverImageName ?? undefined,
  };
}

type ProposalParams = {
  params: Promise<{
    proposalId: string;
  }>;
};

export async function PATCH(request: Request, { params }: ProposalParams) {
  try {
    const { proposalId } = await params;
    const payload = await parseUpdatePayload(request, proposalId);
    const result = await updateBookProposal(payload, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się zaktualizować propozycji książki.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: ProposalParams) {
  try {
    const { proposalId } = await params;
    const result = await deleteBookProposal(proposalId, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się usunąć propozycji książki.",
      },
      { status: 500 },
    );
  }
}

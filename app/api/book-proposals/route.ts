import { NextResponse } from "next/server";
import { createBookProposal, listBookProposals } from "../../../lib/db/book-proposals";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getAccessToken(request: Request) {
  return request.headers.get("authorization") ?? "";
}

async function parseCreatePayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const coverImageFile = formData.get("coverImageFile") ?? formData.get("proposal-cover-image-file");

    if (coverImageFile instanceof File) {
      const bytes = new Uint8Array(await coverImageFile.arrayBuffer());
      const base64 = Buffer.from(bytes).toString("base64");

      return {
        clubId: String(formData.get("clubId") ?? ""),
        title: String(formData.get("title") ?? ""),
        author: String(formData.get("author") ?? ""),
        description: String(formData.get("description") ?? ""),
        coverImageUrl: `data:${coverImageFile.type || "application/octet-stream"};base64,${base64}`,
        coverImageName: coverImageFile.name,
      };
    }

    return {
      clubId: String(formData.get("clubId") ?? ""),
      title: String(formData.get("title") ?? ""),
      author: String(formData.get("author") ?? ""),
      description: String(formData.get("description") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
      coverImageName: String(formData.get("coverImageName") ?? ""),
    };
  }

  const body = (await request.json()) as {
    clubId?: string;
    title?: string;
    author?: string;
    description?: string | null;
    coverImageUrl?: string | null;
    coverImageName?: string | null;
  };

  return {
    clubId: body.clubId ?? "",
    title: body.title ?? "",
    author: body.author ?? "",
    description: body.description ?? "",
    coverImageUrl: body.coverImageUrl ?? "",
    coverImageName: body.coverImageName ?? "",
  };
}

export async function GET(request: Request) {
  try {
    const clubId = new URL(request.url).searchParams.get("clubId") ?? "";
    const result = await listBookProposals(clubId, getAccessToken(request));

    return NextResponse.json(result, {
      status: result.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się wczytać propozycji książek.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseCreatePayload(request);
    const result = await createBookProposal(payload, getAccessToken(request));

    return NextResponse.json(result, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "Nie udało się utworzyć propozycji książki. Spróbuj ponownie.",
      },
      { status: 500 },
    );
  }
}

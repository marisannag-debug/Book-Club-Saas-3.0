import { z } from "zod";

export const BOOK_PROPOSAL_TITLE_MIN_LENGTH = 3;
export const BOOK_PROPOSAL_TITLE_MAX_LENGTH = 120;
export const BOOK_PROPOSAL_AUTHOR_MIN_LENGTH = 2;
export const BOOK_PROPOSAL_AUTHOR_MAX_LENGTH = 120;
export const BOOK_PROPOSAL_DESCRIPTION_MAX_LENGTH = 280;
export const BOOK_PROPOSAL_COVER_IMAGE_NAME_MAX_LENGTH = 255;
export const BOOK_PROPOSAL_COVER_IMAGE_URL_MAX_LENGTH = 100000;

const optionalText = z.union([z.string(), z.null()]).optional();

export const bookProposalListQuerySchema = z.object({
  clubId: z.string().trim().min(1, "Brakuje identyfikatora klubu."),
});

export const bookProposalCreateSchema = z.object({
  clubId: z.string().trim().min(1, "Brakuje identyfikatora klubu."),
  title: z.string().trim().min(BOOK_PROPOSAL_TITLE_MIN_LENGTH, "Tytuł musi mieć co najmniej 3 znaki.").max(BOOK_PROPOSAL_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${BOOK_PROPOSAL_TITLE_MAX_LENGTH} znaków.`),
  author: z.string().trim().min(BOOK_PROPOSAL_AUTHOR_MIN_LENGTH, "Autor musi mieć co najmniej 2 znaki.").max(BOOK_PROPOSAL_AUTHOR_MAX_LENGTH, `Autor może mieć maksymalnie ${BOOK_PROPOSAL_AUTHOR_MAX_LENGTH} znaków.`),
  description: optionalText.refine(
    (value) => !value || value.trim().length <= BOOK_PROPOSAL_DESCRIPTION_MAX_LENGTH,
    `Opis może mieć maksymalnie ${BOOK_PROPOSAL_DESCRIPTION_MAX_LENGTH} znaków.`,
  ),
  coverImageUrl: optionalText.refine(
    (value) => !value || value.trim().length <= BOOK_PROPOSAL_COVER_IMAGE_URL_MAX_LENGTH,
    `Adres grafiki może mieć maksymalnie ${BOOK_PROPOSAL_COVER_IMAGE_URL_MAX_LENGTH} znaków.`,
  ),
  coverImageName: optionalText.refine(
    (value) => !value || value.trim().length <= BOOK_PROPOSAL_COVER_IMAGE_NAME_MAX_LENGTH,
    `Nazwa pliku może mieć maksymalnie ${BOOK_PROPOSAL_COVER_IMAGE_NAME_MAX_LENGTH} znaków.`,
  ),
});

export const bookProposalUpdateSchema = z
  .object({
    proposalId: z.string().trim().min(1, "Brakuje identyfikatora propozycji."),
    title: z
      .string()
      .trim()
      .min(BOOK_PROPOSAL_TITLE_MIN_LENGTH, "Tytuł musi mieć co najmniej 3 znaki.")
      .max(BOOK_PROPOSAL_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${BOOK_PROPOSAL_TITLE_MAX_LENGTH} znaków.`)
      .optional(),
    author: z
      .string()
      .trim()
      .min(BOOK_PROPOSAL_AUTHOR_MIN_LENGTH, "Autor musi mieć co najmniej 2 znaki.")
      .max(BOOK_PROPOSAL_AUTHOR_MAX_LENGTH, `Autor może mieć maksymalnie ${BOOK_PROPOSAL_AUTHOR_MAX_LENGTH} znaków.`)
      .optional(),
    description: optionalText.refine(
      (value) => !value || value.trim().length <= BOOK_PROPOSAL_DESCRIPTION_MAX_LENGTH,
      `Opis może mieć maksymalnie ${BOOK_PROPOSAL_DESCRIPTION_MAX_LENGTH} znaków.`,
    ),
    coverImageUrl: optionalText.refine(
      (value) => !value || value.trim().length <= BOOK_PROPOSAL_COVER_IMAGE_URL_MAX_LENGTH,
      `Adres grafiki może mieć maksymalnie ${BOOK_PROPOSAL_COVER_IMAGE_URL_MAX_LENGTH} znaków.`,
    ),
    coverImageName: optionalText.refine(
      (value) => !value || value.trim().length <= BOOK_PROPOSAL_COVER_IMAGE_NAME_MAX_LENGTH,
      `Nazwa pliku może mieć maksymalnie ${BOOK_PROPOSAL_COVER_IMAGE_NAME_MAX_LENGTH} znaków.`,
    ),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.author !== undefined ||
      value.description !== undefined ||
      value.coverImageUrl !== undefined ||
      value.coverImageName !== undefined,
    {
      message: "Musisz podać przynajmniej jedno pole do aktualizacji.",
    },
  );

export type BookProposalListQuery = z.infer<typeof bookProposalListQuerySchema>;
export type BookProposalCreateInput = z.infer<typeof bookProposalCreateSchema>;
export type BookProposalUpdateInput = z.infer<typeof bookProposalUpdateSchema>;

export type BookProposalViewModel = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  coverImageName: string;
  createdBy: string;
  createdByLabel: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  votesCount?: number;
  currentUserHasVoted?: boolean;
};

export type BookProposalVoteState = {
  votesCount?: number;
  currentUserHasVoted?: boolean;
};

export function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

export function mapBookProposalViewModel(
  row: {
    id: string;
    club_id: string;
    title: string;
    author: string;
    description: string | null;
    cover_image_url: string | null;
    cover_image_name: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  },
  userId?: string,
  userRole?: "host" | "member" | null,
  voteState?: BookProposalVoteState,
): BookProposalViewModel {
  const isOwner = userId === row.created_by;
  const isHost = userRole === "host";

  const formatDate = (isoString: string) => {
    try {
      return isoString.split("T")[0]; // Zwraca YYYY-MM-DD
    } catch {
      return isoString;
    }
  };

  return {
    id: row.id,
    clubId: row.club_id,
    title: row.title,
    author: row.author,
    description: row.description ?? "",
    coverImageUrl: row.cover_image_url ?? "",
    coverImageName: row.cover_image_name ?? "",
    createdBy: row.created_by,
    createdByLabel: isOwner ? "Ty" : "Inny klubowicz",
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
    canEdit: isOwner || isHost,
    canDelete: isOwner || isHost,
    votesCount: voteState?.votesCount ?? 0,
    currentUserHasVoted: voteState?.currentUserHasVoted ?? false,
  };
}

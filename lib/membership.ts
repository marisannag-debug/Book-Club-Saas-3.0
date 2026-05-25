import { z } from "zod";

export const MEMBERSHIP_DISPLAY_NAME_MIN_LENGTH = 2;
export const MEMBERSHIP_DISPLAY_NAME_MAX_LENGTH = 40;

export const membershipDisplayNameSchema = z
  .string()
  .trim()
  .min(MEMBERSHIP_DISPLAY_NAME_MIN_LENGTH, "Nazwa wyświetlana musi mieć co najmniej 2 znaki.")
  .max(MEMBERSHIP_DISPLAY_NAME_MAX_LENGTH, "Nazwa wyświetlana może mieć maksymalnie 40 znaków.");

export const membershipActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
    clubId: z.string().trim().min(1, "Brakuje identyfikatora klubu."),
  }),
  z.object({
    action: z.literal("leave"),
    clubId: z.string().trim().min(1, "Brakuje identyfikatora klubu."),
  }),
  z.object({
    action: z.literal("rename"),
    clubId: z.string().trim().min(1, "Brakuje identyfikatora klubu."),
    displayName: membershipDisplayNameSchema,
  }),
]);

export type MembershipActionInput = z.infer<typeof membershipActionSchema>;

export function normalizeMemberDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateMemberDisplayName(value: string) {
  const result = membershipDisplayNameSchema.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message ?? "Nazwa wyświetlana jest nieprawidłowa.";
}

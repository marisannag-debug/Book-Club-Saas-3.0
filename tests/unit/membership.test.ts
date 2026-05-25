import { describe, expect, it } from "vitest";
import {
  membershipActionSchema,
  normalizeMemberDisplayName,
  validateMemberDisplayName,
} from "../../lib/membership";

describe("membership validation", () => {
  it("normalizes whitespace in display names", () => {
    expect(normalizeMemberDisplayName("  Marta   Nowak  ")).toBe("Marta Nowak");
  });

  it("rejects short display names", () => {
    expect(validateMemberDisplayName("A")).toBe("Nazwa wyświetlana musi mieć co najmniej 2 znaki.");
  });

  it("accepts the rename action payload", () => {
    const parsed = membershipActionSchema.safeParse({
      action: "rename",
      clubId: "club-1",
      displayName: "Marta Nowak",
    });

    expect(parsed.success).toBe(true);
  });
});

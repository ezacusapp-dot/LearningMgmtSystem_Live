import { achievementCertificateRepository as repo } from "./achievement.repository";
import {
  createAchievementCertificateSchema,
  updateAchievementCertificateSchema,
  listQuerySchema,
  zodErrorToFieldErrors,
} from "./achievement.validation";
import { AppError } from "./achievement.type";
import type {
  AchievementCertificate,
  CreateAchievementCertificateInput,
  UpdateAchievementCertificateInput,
  ListAchievementCertificatesQuery,
  PaginatedResult,
} from "./achievement.type";

// ─────────────────────────────────────────────────────────────
// Service — business rules live here: validation, duplicate
// checks, overlap checks. Controllers call only this layer.
// ─────────────────────────────────────────────────────────────

/** Helper to round percentages to 2 decimal places (optional) */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export const achievementCertificateService = {
  async list(
    rawQuery: unknown
  ): Promise<PaginatedResult<AchievementCertificate>> {
    const parsed = listQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new AppError(
        "Invalid query parameters.",
        "VALIDATION_ERROR",
        400,
        zodErrorToFieldErrors(parsed.error)
      );
    }
    return repo.findMany(parsed.data as ListAchievementCertificatesQuery);
  },

  async getById(id: string): Promise<AchievementCertificate> {
    const cert = await repo.findById(id);
    if (!cert) {
      throw new AppError("Achievement certificate not found.", "NOT_FOUND", 404);
    }
    return cert;
  },

  async create(rawInput: unknown): Promise<AchievementCertificate> {
    const parsed = createAchievementCertificateSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(
        "Validation failed.",
        "VALIDATION_ERROR",
        422,
        zodErrorToFieldErrors(parsed.error)
      );
    }
    const input = parsed.data as CreateAchievementCertificateInput;

    // Optional: Round to 2 decimal places for consistency
    input.percentFrom = roundToTwoDecimals(input.percentFrom);
    input.percentTo = roundToTwoDecimals(input.percentTo);

    const existingByName = await repo.findByName(input.certificateName);
    if (existingByName) {
      throw new AppError(
        "A certificate with this name already exists.",
        "DUPLICATE_NAME",
        409,
        { certificateName: "This certificate name is already in use." }
      );
    }

    const overlapping = await repo.findOverlapping(input.percentFrom, input.percentTo);
    if (overlapping.length > 0) {
      throw new AppError(
        `Percentage range overlaps with existing band "${overlapping[0].certificateName}" (${overlapping[0].percentFrom}-${overlapping[0].percentTo}%).`,
        "RANGE_OVERLAP",
        409,
        { percentFrom: "This range overlaps an existing certificate band." }
      );
    }

    return repo.create(input);
  },


  // achievement.service.ts — ADD this method inside achievementCertificateService

  /**
   * Given a final exam percentage, returns the grade band it falls into
   * (certificateName, designation, colorCode, etc.) or throws NOT_FOUND
   * if no band covers that percentage — which means the admin hasn't
   * configured a full 0–100 range yet.
   */
  async getBandForPercentage(percentage: number): Promise<AchievementCertificate> {
    if (typeof percentage !== "number" || Number.isNaN(percentage)) {
      throw new AppError("A valid percentage is required.", "VALIDATION_ERROR", 422);
    }

    const band = await repo.findByPercentage(percentage);
    if (!band) {
      throw new AppError(
        `No achievement certificate band is configured for ${percentage}%. Please ask an admin to add one.`,
        "NO_GRADE_BAND",
        404
      );
    }
    return band;
  },
  async update(
    id: string,
    rawInput: unknown
  ): Promise<AchievementCertificate> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw new AppError("Achievement certificate not found.", "NOT_FOUND", 404);
    }

    const parsed = updateAchievementCertificateSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AppError(
        "Validation failed.",
        "VALIDATION_ERROR",
        422,
        zodErrorToFieldErrors(parsed.error)
      );
    }
    const input = parsed.data as UpdateAchievementCertificateInput;

    // Optional: Round to 2 decimal places for consistency
    if (input.percentFrom !== undefined) {
      input.percentFrom = roundToTwoDecimals(input.percentFrom);
    }
    if (input.percentTo !== undefined) {
      input.percentTo = roundToTwoDecimals(input.percentTo);
    }

    if (input.certificateName && input.certificateName !== existing.certificateName) {
      const dupe = await repo.findByName(input.certificateName);
      if (dupe) {
        throw new AppError(
          "A certificate with this name already exists.",
          "DUPLICATE_NAME",
          409,
          { certificateName: "This certificate name is already in use." }
        );
      }
    }

    const nextFrom = input.percentFrom ?? existing.percentFrom;
    const nextTo = input.percentTo ?? existing.percentTo;

    // Float comparison - works correctly
    if (nextFrom >= nextTo) {
      throw new AppError(
        '"From" percentage must be less than "To" percentage.',
        "VALIDATION_ERROR",
        422,
        { percentFrom: '"From" percentage must be less than "To" percentage.' }
      );
    }

    // Check for overlap with other bands (excluding self)
    const overlapping = await repo.findOverlapping(nextFrom, nextTo, id);
    if (overlapping.length > 0) {
      throw new AppError(
        `Percentage range overlaps with existing band "${overlapping[0].certificateName}" (${overlapping[0].percentFrom}-${overlapping[0].percentTo}%).`,
        "RANGE_OVERLAP",
        409,
        { percentFrom: "This range overlaps an existing certificate band." }
      );
    }

    return repo.update(id, input);
  },

  async remove(id: string): Promise<AchievementCertificate> {
    const existing = await repo.findById(id);
    if (!existing) {
      throw new AppError("Achievement certificate not found.", "NOT_FOUND", 404);
    }
    return repo.delete(id);
  },
};
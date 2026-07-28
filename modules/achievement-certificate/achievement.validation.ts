import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Validation schemas — mirror the client-side rules in
// AchievementCertificateCreate so create/edit stay consistent
// between frontend and backend.
// ─────────────────────────────────────────────────────────────

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createAchievementCertificateSchema = z
  .object({
    certificateName: z
      .string()
      .trim()
      .min(1, "Certificate name is required.")
      .max(150, "Certificate name must be 150 characters or fewer."),
    designation: z
      .string()
      .trim()
      .min(1, "Designation is required.")
      .max(150, "Designation must be 150 characters or fewer."),
    colorCode: z
      .string()
      .trim()
      .regex(hexColorRegex, "Color code must be a valid hex value, e.g. #3C0061."),
    percentFrom: z
      .number({ invalid_type_error: "Percentage from/to must be a valid number." })
      .min(0, '"From" percentage must be between 0 and 100.')
      .max(100, '"From" percentage must be between 0 and 100.')
      .multipleOf(0.01, "Percentage can have up to 2 decimal places."), // Optional: 2 दशांश स्थानांपर्यंत मर्यादा
    percentTo: z
      .number({ invalid_type_error: "Percentage from/to must be a valid number." })
      .min(0, '"To" percentage must be between 0 and 100.')
      .max(100, '"To" percentage must be between 0 and 100.')
      .multipleOf(0.01, "Percentage can have up to 2 decimal places."), // Optional
  })
  .refine((data) => data.percentFrom !== data.percentTo, {
    message: '"From" and "To" percentages cannot be equal.',
    path: ["percentTo"],
  })
  .refine((data) => data.percentFrom < data.percentTo, {
    message: '"From" percentage must be less than "To" percentage.',
    path: ["percentFrom"],
  });

export const updateAchievementCertificateSchema = z
  .object({
    certificateName: z.string().trim().min(1).max(150).optional(),
    designation: z.string().trim().min(1).max(150).optional(),
    colorCode: z.string().trim().regex(hexColorRegex).optional(),
    percentFrom: z
      .number()
      .min(0, '"From" percentage must be between 0 and 100.')
      .max(100, '"From" percentage must be between 0 and 100.')
      .multipleOf(0.01) // Optional
      .optional(),
    percentTo: z
      .number()
      .min(0, '"To" percentage must be between 0 and 100.')
      .max(100, '"To" percentage must be between 0 and 100.')
      .multipleOf(0.01) // Optional
      .optional(),
  })
  .refine(
    (data) =>
      data.percentFrom === undefined ||
      data.percentTo === undefined ||
      data.percentFrom < data.percentTo,
    {
      message: '"From" percentage must be less than "To" percentage.',
      path: ["percentFrom"],
    }
  );
export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["certificateName", "percentFrom", "percentTo", "createdAt"])
    .optional()
    .default("percentFrom"),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const idParamSchema = z.string().min(1, "A valid id is required.");

/** Converts a ZodError into the fieldErrors map used by ApiError responses */
export function zodErrorToFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

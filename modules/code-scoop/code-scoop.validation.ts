import { z } from "zod";

// LEARN (Grades 1–2) added so every edition on the website can be saved.
export const EDITION_VALUES = ["LEARN", "DISCOVER", "CREATE", "INNOVATE"] as const;

// Accepts the frontend's edition ids ("discover") or enum values ("DISCOVER")
const editionSchema = z
  .string()
  .transform((v) => v.trim().toUpperCase())
  .pipe(z.enum(EDITION_VALUES, { message: "Choose a valid grade." }));

// These rules match the frontend form exactly, so the same message appears in both places.
export const createCodeScoopSchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name is too long.")
    .refine((v) => !/\d/.test(v), "Name should not contain numbers."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  mobile: z.string().trim().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
  edition: editionSchema,
  durationMonths: z.coerce
    .number()
    .refine((v) => v === 6 || v === 12, "Choose 6 or 12 months."),
  pin: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  address: z
    .string()
    .trim()
    .min(10, "Enter the full address: house no., street, area and city.")
    .max(500, "Address is too long."),
  consent: z.boolean().refine((v) => v === true, "Please confirm you are the parent or legal guardian."),
});

export const listCodeScoopSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  edition: editionSchema.optional(),
  paymentStatus: z.enum(["UNPAID", "PAID"]).optional(),
});

export const updateCodeScoopSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "PAID"]).optional(),
  deliveryPin: z.string().regex(/^[1-9]\d{5}$/, "PIN code must be 6 digits.").optional(),
  deliveryAddress: z.string().max(500).optional(),
});

export const validateCreateCodeScoop = (d: unknown) => createCodeScoopSchema.parse(d);
export const validateListCodeScoop = (d: unknown) => listCodeScoopSchema.parse(d);
export const validateUpdateCodeScoop = (d: unknown) => updateCodeScoopSchema.parse(d);

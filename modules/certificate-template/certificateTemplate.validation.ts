// modules/certificate-template/certificateTemplate.validation.ts

import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Must be a valid hex color, e.g. #2A1B5D');

// Accepts: undefined, null, '' (no image chosen yet), or a real base64 data URI.
// '' is normalized to null before the regex runs, so unfilled image fields
// from the builder (which default to '') no longer fail validation.
const base64Image = z.preprocess(
  (val) => (val === '' ? null : val),
  z
    .string()
    .regex(/^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/)
    .nullable()
    .optional()
);

const qrPositionEnum = z.enum(['bottom-right', 'bottom-left', 'top-right']);

export const createCertificateTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required').max(150),
  courseId: z.string().min(1, 'Course is required'),
  courseCode: z.string().max(20).optional(),

  organizationName: z.string().optional().default('CODE EXCELLENCE EDUTECH'),
  primaryColor: hexColor.optional().default('#2A1B5D'),
  accentColor: hexColor.optional().default('#C21E9A'),
  fontFamily: z.string().optional().default('Playfair Display'),

  logoUrl: base64Image,
  signatureUrl: base64Image,
  signature2Url: base64Image,
  backgroundUrl: base64Image,

  signatory1Name: z.string().optional().default('Raina Bafna'),
  signatory1Role: z.string().optional().default('Founder'),
  signatory2Name: z.string().optional().default('Madhavi Patil'),
  signatory2Role: z.string().optional().default('Co-Founder'),

  sealEnabled: z.boolean().optional().default(true),
  qrPosition: qrPositionEnum.optional().default('bottom-right'),

  includeRanking: z.boolean().optional().default(true),
  includeScore: z.boolean().optional().default(true),

  templateVersion: z.number().int().optional(),
  isDraft: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateCertificateTemplateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  // courseId is intentionally NOT updatable — a template is bound to the
  // course it was created for. Create a new template to link a new course.
  courseCode: z.string().max(20).optional(),

  organizationName: z.string().optional(),
  primaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  fontFamily: z.string().optional(),

  logoUrl: base64Image,
  signatureUrl: base64Image,
  signature2Url: base64Image,
  backgroundUrl: base64Image,

  signatory1Name: z.string().optional(),
  signatory1Role: z.string().optional(),
  signatory2Name: z.string().optional(),
  signatory2Role: z.string().optional(),

  sealEnabled: z.boolean().optional(),
  qrPosition: qrPositionEnum.optional(),

  includeRanking: z.boolean().optional(),
  includeScore: z.boolean().optional(),

  templateVersion: z.number().int().optional(),
  isDraft: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const certificateTemplateListQuerySchema = z.object({
  courseId: z.string().min(1).optional(),
  isDraft: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateCertificateTemplateSchemaType = z.infer<
  typeof createCertificateTemplateSchema
>;
export type UpdateCertificateTemplateSchemaType = z.infer<
  typeof updateCertificateTemplateSchema
>;
export type CertificateTemplateListQuerySchemaType = z.infer<
  typeof certificateTemplateListQuerySchema
>;
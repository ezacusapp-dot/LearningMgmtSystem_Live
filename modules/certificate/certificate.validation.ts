import { z } from "zod";

export const generateCertificateSchema = z.object({
  studentId: z
    .number({ error: "studentId is required" })
    .int()
    .positive(),
  courseId: z.string({ error: "courseId is required" }).min(1),
  examAttemptId: z
    .string({ error: "examAttemptId is required" })
    .min(1),
});

export const revokeCertificateSchema = z.object({
  reason: z
    .string({ error: "reason is required" })
    .min(5, "Reason must be at least 5 characters")
    .max(500),
});

export const certificateListQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  courseId: z.string().min(1).optional(),
  status: z.enum(["Issued", "Revoked", "Expired"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const certificateNumberParamSchema = z.object({
  certificateNumber: z.string().min(5),
});
export type GenerateCertificateSchemaType = z.infer<
  typeof generateCertificateSchema
>;
export type RevokeCertificateSchemaType = z.infer<
  typeof revokeCertificateSchema
>;
export type CertificateListQuerySchemaType = z.infer<
  typeof certificateListQuerySchema
>;
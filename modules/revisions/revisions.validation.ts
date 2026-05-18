
import { z } from "zod";

const revisionContentTypeEnum = z.enum(["VIDEO", "PDF"], {
  errorMap: () => ({ message: "Content type must be VIDEO or PDF" }),
});

// ================= REVISION CONTENT SCHEMA =================
const revisionContentSchema = z.object({
  contentType: revisionContentTypeEnum,
  fileUrl: z.string().min(1, "File URL is required"),
  order: z.number({ required_error: "Order is required" }),
});

// ================= CREATE =================
export const createRevisionSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  title: z.string().optional(),
  isActive: z.boolean().optional(),
  contents: z.array(revisionContentSchema).optional(),
});

// ================= UPDATE =================
export const updateRevisionSchema = z.object({
  title: z.string().optional(),
  isActive: z.boolean().optional(),
  contents: z.array(revisionContentSchema).optional(),
});

// ================= UPDATE CONTENT =================
export const updateRevisionContentSchema = z.object({
  contentType: revisionContentTypeEnum.optional(),
  fileUrl: z.string().min(1).optional(),
  order: z.number().optional(),
});

// ================= VALIDATORS =================
export const validateCreateRevision = (data: unknown) =>
  createRevisionSchema.parse(data);

export const validateUpdateRevision = (data: unknown) =>
  updateRevisionSchema.parse(data);

export const validateUpdateRevisionContent = (data: unknown) =>
  updateRevisionContentSchema.parse(data);
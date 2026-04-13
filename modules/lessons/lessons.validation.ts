import { z } from "zod";

// ================= CREATE =================
export const createLessonSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  title: z.string().min(1, "Title is required"),
  contentType: z.string().min(1, "Content type is required"),
  fileUrl: z.string().optional(),
  order: z.number().optional(),
});

// ================= UPDATE =================
export const updateLessonSchema = z.object({
  title: z.string().optional(),
  contentType: z.string().optional(),
  fileUrl: z.string().nullable().optional(),
  order: z.number().optional(),
    isActive:    z.boolean().optional(), 
});

// ================= VALIDATORS =================
export const validateCreateLesson = (data: unknown) => {
  return createLessonSchema.parse(data);
};

export const validateUpdateLesson = (data: unknown) => {
  return updateLessonSchema.parse(data);
};
// import { z } from "zod";

// // ================= CREATE =================
// export const createLessonSchema = z.object({
//   moduleId: z.string().min(1, "Module ID is required"),
//   title: z.string().min(1, "Title is required"),
//   contentType: z.string().min(1, "Content type is required"),
//   fileUrl: z.string().optional(),
//   order: z.number().optional(),
// });

// // ================= UPDATE =================
// export const updateLessonSchema = z.object({
//   title: z.string().optional(),
//   contentType: z.string().optional(),
//   fileUrl: z.string().nullable().optional(),
//   order: z.number().optional(),
//     isActive:    z.boolean().optional(), 
// });

// // ================= VALIDATORS =================
// export const validateCreateLesson = (data: unknown) => {
//   return createLessonSchema.parse(data);
// };

// export const validateUpdateLesson = (data: unknown) => {
//   return updateLessonSchema.parse(data);
// };
// ============================================================
// lessons.validation.ts
// ============================================================

import { z } from "zod";

const contentTypeEnum = z.enum(
  ["VIDEO", "PDF", "DOCUMENT", "ASSIGNMENT", "LINK"],
  { errorMap: () => ({ message: "contentType must be VIDEO, PDF, DOCUMENT, ASSIGNMENT, or LINK" }) }
);

// ================= CREATE =================
export const createLessonSchema = z.object({
  moduleId:    z.string().min(1, "Module ID is required"),
  title:       z.string().min(1, "Title is required"),
  contentType: contentTypeEnum,
  fileUrl:     z.string().optional(),
  videoLinks:  z.array(z.string().url("Each video link must be a valid URL")).max(3).optional(),
  order:       z.number().optional(),
  isActive:    z.boolean().optional(),
});

// ================= UPDATE =================
export const updateLessonSchema = z.object({
  title:       z.string().min(1, "Title cannot be empty").optional(),
  contentType: contentTypeEnum.optional(),
  fileUrl:     z.string().nullable().optional(),
  videoLinks:  z.array(z.string().url("Each video link must be a valid URL")).max(3).optional(),
  order:       z.number().optional(),
  isActive:    z.boolean().optional(),
});

// ================= VALIDATORS =================
export const validateCreateLesson = (data: unknown) =>
  createLessonSchema.parse(data);

export const validateUpdateLesson = (data: unknown) =>
  updateLessonSchema.parse(data);
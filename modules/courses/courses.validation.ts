import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.string().optional(),
  levelId: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  status: z.string().optional(),
});

// ✅ IMPORTANT EXPORT
export const validateCreateCourse = (data: any) => {
  return createCourseSchema.parse(data);
};
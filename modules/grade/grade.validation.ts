import { z } from "zod";

export const createGradeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // minMarks: z.number().optional(),
  // maxMarks: z.number().optional(),
  sortOrder: z.number().optional(),
});

export const updateGradeSchema = z.object({
  name: z.string().optional(),
  // minMarks: z.number().optional(),
  // maxMarks: z.number().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateGrade = (data: any) => {
  return createGradeSchema.parse(data);
};

export const validateUpdateGrade = (data: any) => {
  return updateGradeSchema.parse(data);
};
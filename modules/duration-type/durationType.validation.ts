import { z } from "zod";

export const createDurationTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const updateDurationTypeSchema = z.object({
  name: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateDurationType = (data: any) => {
  return createDurationTypeSchema.parse(data);
};

export const validateUpdateDurationType = (data: any) => {
  return updateDurationTypeSchema.parse(data);
};
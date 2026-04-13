import { z } from "zod";

export const createLevelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const updateLevelSchema = z.object({
  name: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateLevel = (data: any) => {
  return createLevelSchema.parse(data);
};

export const validateUpdateLevel = (data: any) => {
  return updateLevelSchema.parse(data);
};
import { z } from "zod";

export const createAwardCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const updateAwardCategorySchema = z.object({
  name: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateAwardCategory = (data: any) => {
  return createAwardCategorySchema.parse(data);
};

export const validateUpdateAwardCategory = (data: any) => {
  return updateAwardCategorySchema.parse(data);
};
import { z } from "zod";

export const createValiditySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const updateValiditySchema = z.object({
  name: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateValidity = (data: any) => {
  return createValiditySchema.parse(data);
};

export const validateUpdateValidity = (data: any) => {
  return updateValiditySchema.parse(data);
};
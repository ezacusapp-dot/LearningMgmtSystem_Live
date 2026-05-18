import { z } from "zod";

const DurationUnitEnum = z.enum(["Days", "Weeks", "Months", "Years"]);

export const createDurationTypeSchema = z.object({
  value: z.number().int().min(1, "Value must be at least 1"),
  unit: DurationUnitEnum,
  sortOrder: z.number().optional(),
});

export const updateDurationTypeSchema = z.object({
  value: z.number().int().min(1).optional(),
  unit: DurationUnitEnum.optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateDurationType = (data: any) => {
  return createDurationTypeSchema.parse(data);
};

export const validateUpdateDurationType = (data: any) => {
  return updateDurationTypeSchema.parse(data);
};
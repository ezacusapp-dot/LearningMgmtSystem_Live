import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  categoryLogo: z.string().optional(),
  categoryBackground: z.string().optional(),
  isDraft: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const validateCreateCategory = (data: any) => {
  return createCategorySchema.parse(data);
};
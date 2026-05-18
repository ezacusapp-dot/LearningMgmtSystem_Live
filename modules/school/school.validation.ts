import { z } from "zod";

export const createSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  region: z.enum(["North", "South", "East", "West", "Central"], {
    errorMap: () => ({ message: "Invalid region" }),
  }),
  state: z.enum(["California", "Washington", "New York", "Texas", "Florida", "Illinois"], {
    errorMap: () => ({ message: "Invalid state" }),
  }),
  students: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  subscription: z.enum(["active", "trial", "expired"]).optional().default("trial"),
  performance: z.number().int().min(0).max(100).optional().default(0),
  password: z.string().min(6, "Password must be at least 6 characters"), // ✅ added
});

export const updateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  adminName: z.string().min(1).optional(),
  adminEmail: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  region: z.enum(["North", "South", "East", "West", "Central"]).optional(),
  state: z.enum(["California", "Washington", "New York", "Texas", "Florida", "Illinois"]).optional(),
  students: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  subscription: z.enum(["active", "trial", "expired"]).optional(),
  performance: z.number().int().min(0).max(100).optional(),
  password: z.string().min(6).optional(), // ✅ added (optional for update)
});

// ✅ New login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const validateCreateSchool = (data: any) => createSchoolSchema.parse(data);
export const validateUpdateSchool = (data: any) => updateSchoolSchema.parse(data);
export const validateLogin = (data: any) => loginSchema.parse(data);
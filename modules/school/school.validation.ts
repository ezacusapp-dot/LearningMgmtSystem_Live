// import { z } from "zod";

// export const createSchoolSchema = z.object({
//   name: z.string().min(1, "School name is required"),
//   adminName: z.string().min(1, "Admin name is required"),
//   adminEmail: z.string().email("Invalid email address"),
//   phone: z.string().min(1, "Phone number is required"),
//   address: z.string().min(1, "Address is required"),
//   region: z.enum(["North", "South", "East", "West", "Central"]),
//   state: z.enum(["California", "Washington", "New York", "Texas", "Florida", "Illinois"]),
//   students: z.number().int().min(0).optional().default(0),
//   active: z.boolean().optional().default(true),
//   subscription: z.enum(["active", "trial", "expired"]).optional().default("trial"),
//   performance: z.number().int().min(0).max(100).optional().default(0),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// export const updateSchoolSchema = z.object({
//   name: z.string().min(1).optional(),
//   adminName: z.string().min(1).optional(),
//   adminEmail: z.string().email().optional(),
//   phone: z.string().min(1).optional(),
//   address: z.string().min(1).optional(),
//   region: z.enum(["North", "South", "East", "West", "Central"]).optional(),
//   state: z.enum(["California", "Washington", "New York", "Texas", "Florida", "Illinois"]).optional(),
//   students: z.number().int().min(0).optional(),
//   active: z.boolean().optional(),
//   subscription: z.enum(["active", "trial", "expired"]).optional(),
//   performance: z.number().int().min(0).max(100).optional(),
//   password: z.string().min(6).optional(),
// });

// // Login schema
// export const loginSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(1, "Password is required"),
// });

// export const validateCreateSchool = (data: any) => createSchoolSchema.parse(data);
// export const validateUpdateSchool = (data: any) => updateSchoolSchema.parse(data);
// export const validateLogin = (data: any) => loginSchema.parse(data);


import { z } from "zod";

// Shared list so create/update schemas can't drift out of sync again
const INDIAN_STATES = [
  "All State",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const createSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  region: z.enum(["North", "South", "East", "West", "Central"]),
  state: z.enum(INDIAN_STATES),
  students: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
  subscription: z.enum(["active", "trial", "expired"]).optional().default("trial"),
  performance: z.number().int().min(0).max(100).optional().default(0),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  adminName: z.string().min(1).optional(),
  adminEmail: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  region: z.enum(["North", "South", "East", "West", "Central"]).optional(),
  state: z.enum(INDIAN_STATES).optional(),
  students: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  subscription: z.enum(["active", "trial", "expired"]).optional(),
  performance: z.number().int().min(0).max(100).optional(),
  password: z.string().min(6).optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const validateCreateSchool = (data: any) => createSchoolSchema.parse(data);
export const validateUpdateSchool = (data: any) => updateSchoolSchema.parse(data);
export const validateLogin = (data: any) => loginSchema.parse(data);
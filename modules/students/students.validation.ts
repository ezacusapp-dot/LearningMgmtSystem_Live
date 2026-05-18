

// import { z } from "zod";

// // ✅ Base schema (NO refine here)
// const baseStudentSchema = z.object({
//   firstName: z.string().min(1),
//   middleName: z.string().optional(),
//   lastName: z.string().min(1),

//   studentMobile: z.string().optional(),
//   studentEmail: z.string().email().optional(),

//   parentMobile: z.string().min(10),
//   parentEmail: z.string().email().optional(),

//   standard: z.string().min(1),  // ✅ Changed from 'grade' to 'standard'
//   batch: z.string().optional(),

//   schoolYear: z.string().min(4),
//   address: z.string().optional(),
//   status: z.string().optional(),  // ✅ Added status as string
// });

// // ✅ Create Schema (with refine)
// export const createStudentSchema = baseStudentSchema.refine(
//   (data) => data.studentMobile || data.studentEmail,
//   {
//     message: "Either studentMobile or studentEmail is required",
//   }
// );

// // ✅ Update Schema (NO refine, but partial allowed)
// export const updateStudentSchema = baseStudentSchema.partial();

// // ✅ Validators
// export const validateCreateStudent = (data: any) => {
//   return createStudentSchema.parse(data);
// };

// export const validateUpdateStudent = (data: any) => {
//   return updateStudentSchema.parse(data);
// };

import { z } from "zod";

// ── Username: lowercase letters, numbers, dot; 6–20 chars; must start with a letter ──
const usernameSchema = z
  .string()
  .min(6, "Username must be at least 6 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z]/, "Username must start with a lowercase letter")
  .regex(
    /^[a-z][a-z0-9.]{4,18}[a-z0-9]$/,
    "Username: only lowercase letters, numbers, and dots allowed"
  );

// ── Password: min 8, uppercase, lowercase, digit, special char ──
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[@#$!%^&*]/,
    "Password must contain at least one special character (@#$!%^&*)"
  );

const baseStudentSchema = z.object({
  firstName:    z.string().min(1, "First name is required"),
  middleName:   z.string().optional(),
  lastName:     z.string().min(1, "Last name is required"),

  studentEmail:  z.string().email("Invalid student email").optional().or(z.literal("")),
  studentMobile: z.string().optional(),   // kept optional for backward compat

  username: usernameSchema,
  password: passwordSchema,

  parentMobile: z.string().min(10, "Parent mobile must be at least 10 digits"),
  parentEmail:  z.string().email("Invalid parent email").optional().or(z.literal("")),

  standard:   z.string().min(1, "Grade is required"),
  batch:      z.string().optional(),
  schoolYear: z.string().min(4, "School year is required"),
  address:    z.string().optional(),
  status:     z.string().optional(),
});

// ── Create: username + password are required (already non-optional in base) ──
export const createStudentSchema = baseStudentSchema;

// ── Update: everything is optional ──
export const updateStudentSchema = baseStudentSchema.partial();

export const validateCreateStudent = (data: any) => createStudentSchema.parse(data);
export const validateUpdateStudent  = (data: any) => updateStudentSchema.parse(data);

// import { ModuleType } from "./modules.types";

// // export const validateModuleInput = (body: ModuleType) => {
// //   const { courseId, title, order } = body;

// //   if (!courseId || typeof courseId !== "string") {
// //     return "Course ID is required";
// //   }

// //   if (!title || typeof title !== "string") {
// //     return "Title is required";
// //   }

// //   if (order === undefined || typeof order !== "number") {
// //     return "Order must be a number";
// //   }

// //   return null; // No error
// // };
// // modules.validation.ts

// export const validateModuleInput = (body: Partial<ModuleType>, isPartial = false) => {
//   const { courseId, title, order, isActive } = body;

//   if (!isPartial && (!courseId || typeof courseId !== "string"))
//     return "Course ID is required";

//   if (title !== undefined && typeof title !== "string")
//     return "Title must be a string";

//   if (!isPartial && !title?.trim())
//     return "Title is required";

//   if (order !== undefined && typeof order !== "number")
//     return "Order must be a number";

//   if (!isPartial && order === undefined)
//     return "Order is required";

//   if (isActive !== undefined && typeof isActive !== "boolean")
//     return "isActive must be a boolean";

//   return null;
// };
// ============================================================
// modules.validation.ts
// ============================================================

import { z } from "zod";

const moduleTypeEnum = z
  .enum([
    "LESSON",
    "REVISION",
    "QUIZ",
    "FINAL_QUIZ",
  ])
  .refine(
    (val) =>
      ["LESSON", "REVISION", "QUIZ", "FINAL_QUIZ"].includes(val),
    {
      message:
        "type must be LESSON, REVISION, QUIZ, or FINAL_QUIZ",
    }
  );

// ================= CREATE =================
export const createModuleSchema = z.object({
  courseId:    z.string().min(1, "Course ID is required"),
  title:       z.string().min(1, "Title is required"),
  order: z.coerce.number().min(1, {
  message: "Order is required",
}),
  type:        moduleTypeEnum.optional(),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
});

// ================= UPDATE =================
export const updateModuleSchema = z.object({
  title:       z.string().min(1, "Title cannot be empty").optional(),
  order:       z.number().optional(),
  type:        moduleTypeEnum.optional(),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
});

export const validateCreateModule = (data: unknown) => createModuleSchema.parse(data);
export const validateUpdateModule = (data: unknown) => updateModuleSchema.parse(data);

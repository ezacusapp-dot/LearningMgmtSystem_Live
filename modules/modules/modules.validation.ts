import { ModuleType } from "./modules.types";

// export const validateModuleInput = (body: ModuleType) => {
//   const { courseId, title, order } = body;

//   if (!courseId || typeof courseId !== "string") {
//     return "Course ID is required";
//   }

//   if (!title || typeof title !== "string") {
//     return "Title is required";
//   }

//   if (order === undefined || typeof order !== "number") {
//     return "Order must be a number";
//   }

//   return null; // No error
// };
// modules.validation.ts

export const validateModuleInput = (body: Partial<ModuleType>, isPartial = false) => {
  const { courseId, title, order, isActive } = body;

  if (!isPartial && (!courseId || typeof courseId !== "string"))
    return "Course ID is required";

  if (title !== undefined && typeof title !== "string")
    return "Title must be a string";

  if (!isPartial && !title?.trim())
    return "Title is required";

  if (order !== undefined && typeof order !== "number")
    return "Order must be a number";

  if (!isPartial && order === undefined)
    return "Order is required";

  if (isActive !== undefined && typeof isActive !== "boolean")
    return "isActive must be a boolean";

  return null;
};
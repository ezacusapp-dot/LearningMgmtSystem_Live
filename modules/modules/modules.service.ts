// import {
//   createModuleRepo,
//   getModulesRepo,
//   countModulesRepo,
//   updateModuleRepo,
//   deleteModuleRepo,
//   findModuleByIdRepo,
// } from "./modules.repository";
// import { ModuleType } from "./modules.types";

// // CREATE
// export const createModuleService = async (data: ModuleType) => createModuleRepo(data);

// // GET
// // export const getModulesService = async (query: any) => {
// //   const { page = 1, limit = 10, search, courseId } = query;
// //   const skip = (page - 1) * limit;

// //   const where: any = {};
// //   if (search) where.title = { contains: search, mode: "insensitive" };
// //   if (courseId) where.courseId = courseId;

// //   const [total, modules] = await Promise.all([countModulesRepo(where), getModulesRepo(where, skip, limit)]);

// //   return { data: modules, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
// // };
// export const getModulesService = async (query: any) => {
//   // ✅ Explicitly convert to numbers
//   const page  = Number(query.page)  > 0 ? Number(query.page)  : 1;
//   const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
//   const search   = query.search   || "";
//   const courseId = query.courseId || undefined;

//   const skip = (page - 1) * limit;

//   const where: any = {};
//   if (search)   where.title    = { contains: search, mode: "insensitive" };
//   if (courseId) where.courseId = courseId;

//   const [total, modules] = await Promise.all([
//     countModulesRepo(where),
//     getModulesRepo(where, skip, limit),
//   ]);

//   return {
//     data: modules,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// // UPDATE
// export const updateModuleService = async (id: string, data: Partial<ModuleType>) => {
//   const existing = await findModuleByIdRepo(id);
//   if (!existing) throw new Error("Module not found");
//   return updateModuleRepo(id, data);
// };

// // DELETE
// export const deleteModuleService = async (id: string) => {
//   const existing = await findModuleByIdRepo(id);
//   if (!existing) throw new Error("Module not found");
//   return deleteModuleRepo(id);
// };
// ============================================================
// modules.service.ts
// ============================================================

import {
  getModulesRepo,
  countModulesRepo,
  findModuleByIdRepo,
  findModuleByCourseAndOrderRepo,
  createModuleRepo,
  updateModuleRepo,
  deleteModuleRepo,
} from "./modules.repository";
import { CreateModuleDto, UpdateModuleDto } from "./modules.types";

export const getModulesService = async (query: any) => {
  const page     = Number(query.page)  > 0 ? Number(query.page)  : 1;
  const limit    = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const search   = query.search   || "";
  const courseId = query.courseId || undefined;
  const type     = query.type     || undefined;
  const skip     = (page - 1) * limit;

  const where: any = {};
  if (search)   where.title    = { contains: search, mode: "insensitive" };
  if (courseId) where.courseId = courseId;
  if (type)     where.type     = type;

  const [total, data] = await Promise.all([
    countModulesRepo(where),
    getModulesRepo(where, skip, limit),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getModuleByIdService = async (id: string) => {
  const module = await findModuleByIdRepo(id);
  if (!module) throw new Error("Module not found");
  return module;
};

export const createModuleService = async (data: CreateModuleDto) => {
  const conflict = await findModuleByCourseAndOrderRepo(data.courseId, data.order);
  if (conflict)
    throw new Error(`A module with order ${data.order} already exists in this course`);
  return createModuleRepo(data);
};

export const updateModuleService = async (id: string, data: UpdateModuleDto) => {
  const existing = await findModuleByIdRepo(id);
  if (!existing) throw new Error("Module not found");

  if (data.order !== undefined && data.order !== existing.order) {
    const conflict = await findModuleByCourseAndOrderRepo(existing.courseId, data.order);
    if (conflict)
      throw new Error(`A module with order ${data.order} already exists in this course`);
  }

  return updateModuleRepo(id, data);
};

export const deleteModuleService = async (id: string) => {
  const existing = await findModuleByIdRepo(id);
  if (!existing) throw new Error("Module not found");
  return deleteModuleRepo(id);
};
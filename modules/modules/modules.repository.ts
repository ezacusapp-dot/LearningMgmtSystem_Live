// import { prisma } from "@/lib/prisma";

// import { ModuleType } from "./modules.types";

// // CREATE
// export const createModuleRepo = async (data: ModuleType) => prisma.modules.create({ data });

// // GET
// export const getModulesRepo = async (where: any, skip: number, limit: number) => {
//   return prisma.modules.findMany({
//     where,
//     skip,
//     take: limit,
//     orderBy: { order: "asc" },
//     include: { courses: { select: { id: true, title: true } } },
//   });
// };

// // COUNT
// export const countModulesRepo = async (where: any) => prisma.modules.count({ where });

// // UPDATE
// export const updateModuleRepo = async (id: string, data: Partial<ModuleType>) =>
//   prisma.modules.update({ where: { id }, data });

// // DELETE
// export const deleteModuleRepo = async (id: string) =>
//   prisma.modules.delete({ where: { id } });

// // FIND BY ID
// export const findModuleByIdRepo = async (id: string) =>
//   prisma.modules.findUnique({ where: { id } });
import { prisma } from "@/lib/prisma";
import { ModuleType } from "./modules.types";

export const createModuleRepo = async (data: ModuleType) =>
  prisma.modules.create({ data });

export const getModulesRepo = async (where: any, skip: number, limit: number) =>
  prisma.modules.findMany({
    where,
    skip,
    take: limit,
    orderBy: { order: "asc" },
    include: { courses: { select: { id: true, title: true } } },
  });

export const countModulesRepo = async (where: any) =>
  prisma.modules.count({ where });

export const updateModuleRepo = async (id: string, data: Partial<ModuleType>) =>
  prisma.modules.update({ where: { id }, data });

export const deleteModuleRepo = async (id: string) =>
  prisma.modules.delete({ where: { id } });

export const findModuleByIdRepo = async (id: string) =>
  prisma.modules.findUnique({ where: { id } });
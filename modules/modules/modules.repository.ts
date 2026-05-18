// // import { prisma } from "@/lib/prisma";

// // import { ModuleType } from "./modules.types";

// // // CREATE
// // export const createModuleRepo = async (data: ModuleType) => prisma.modules.create({ data });

// // // GET
// // export const getModulesRepo = async (where: any, skip: number, limit: number) => {
// //   return prisma.modules.findMany({
// //     where,
// //     skip,
// //     take: limit,
// //     orderBy: { order: "asc" },
// //     include: { courses: { select: { id: true, title: true } } },
// //   });
// // };

// // // COUNT
// // export const countModulesRepo = async (where: any) => prisma.modules.count({ where });

// // // UPDATE
// // export const updateModuleRepo = async (id: string, data: Partial<ModuleType>) =>
// //   prisma.modules.update({ where: { id }, data });

// // // DELETE
// // export const deleteModuleRepo = async (id: string) =>
// //   prisma.modules.delete({ where: { id } });

// // // FIND BY ID
// // export const findModuleByIdRepo = async (id: string) =>
// //   prisma.modules.findUnique({ where: { id } });
// import { prisma } from "@/lib/prisma";
// import { ModuleType } from "./modules.types";

// export const createModuleRepo = async (data: ModuleType) =>
//   prisma.modules.create({ data });

// export const getModulesRepo = async (where: any, skip: number, limit: number) =>
//   prisma.modules.findMany({
//     where,
//     skip,
//     take: limit,
//     orderBy: { order: "asc" },
//     include: { courses: { select: { id: true, title: true } } },
//   });

// export const countModulesRepo = async (where: any) =>
//   prisma.modules.count({ where });

// export const updateModuleRepo = async (id: string, data: Partial<ModuleType>) =>
//   prisma.modules.update({ where: { id }, data });

// export const deleteModuleRepo = async (id: string) =>
//   prisma.modules.delete({ where: { id } });

// export const findModuleByIdRepo = async (id: string) =>
//   prisma.modules.findUnique({ where: { id } });
// ============================================================
// modules.repository.ts
// ============================================================

import { prisma } from "@/lib/prisma";
import { CreateModuleDto, UpdateModuleDto } from "./modules.types";

// Returns the full module tree — lessons, revision+contents, quiz+questions
const moduleInclude = {
  course: { select: { id: true, title: true } },
  lessons: {
    orderBy: { order: "asc" as const },
  },
  revision: {
    include: { contents: { orderBy: { order: "asc" as const } } },
  },
  quiz: {
    include: {
      questions: {
        orderBy: { order: "asc" as const },
        include: { options: { orderBy: { order: "asc" as const } } },
      },
    },
  },
} as const;

export const getModulesRepo = (where: any, skip: number, take: number) =>
  prisma.modules.findMany({ where, skip, take, orderBy: { order: "asc" }, include: moduleInclude });

export const countModulesRepo = (where: any) =>
  prisma.modules.count({ where });

export const findModuleByIdRepo = (id: string) =>
  prisma.modules.findUnique({ where: { id }, include: moduleInclude });

export const findModuleByCourseAndOrderRepo = (courseId: string, order: number) =>
  prisma.modules.findUnique({ where: { courseId_order: { courseId, order } } });

export const createModuleRepo = (data: CreateModuleDto) =>
  prisma.modules.create({ data, include: moduleInclude });

export const updateModuleRepo = (id: string, data: UpdateModuleDto) =>
  prisma.modules.update({ where: { id }, data, include: moduleInclude });

export const deleteModuleRepo = (id: string) =>
  prisma.modules.delete({ where: { id } });
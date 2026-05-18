// import { prisma } from "@/lib/prisma";

// // GET lessons with filter, skip, limit
// export const getLessonsRepo = (where: any, skip: number, take: number) => {
//   return prisma.lessons.findMany({
//     where,
//     skip,
//     take,
//     orderBy: { createdAt: "desc" },
//     include: {
//       module: {
//         select: {
//           id: true,
//           title: true,
//         },
//       },
//     },
//   });
// };

// // COUNT lessons
// export const countLessonsRepo = (where: any) => {
//   return prisma.lessons.count({ where });
// };

// // FIND by ID
// export const findLessonByIdRepo = (id: string) => {
//   return prisma.lessons.findUnique({ where: { id } });
// };

// // CREATE lesson
// export const createLessonRepo = (data: any) => {
//   return prisma.lessons.create({ data });
// };

// // UPDATE lesson
// export const updateLessonRepo = (id: string, data: any) => {
//   return prisma.lessons.update({ where: { id }, data });
// };

// // DELETE lesson
// export const deleteLessonRepo = (id: string) => {
//   return prisma.lessons.delete({ where: { id } });
// };
// ============================================================
// lessons.repository.ts
// ============================================================

import { prisma } from "@/lib/prisma";

const lessonInclude = {
  module: { select: { id: true, title: true } },
} as const;

// ================= GET LESSONS =================
export const getLessonsRepo = (where: any, skip: number, take: number) =>
  prisma.lessons.findMany({
    where,
    skip,
    take,
    orderBy: { order: "asc" },
    include: lessonInclude,
  });

// ================= COUNT =================
export const countLessonsRepo = (where: any) =>
  prisma.lessons.count({ where });

// ================= FIND BY ID =================
export const findLessonByIdRepo = (id: string) =>
  prisma.lessons.findUnique({ where: { id }, include: lessonInclude });

// ================= FIND BY MODULE + ORDER =================
export const findLessonByModuleAndOrderRepo = (moduleId: string, order: number) =>
  prisma.lessons.findUnique({ where: { moduleId_order: { moduleId, order } } });

// ================= CREATE =================
export const createLessonRepo = (data: any) =>
  prisma.lessons.create({ data, include: lessonInclude });

// ================= UPDATE =================
export const updateLessonRepo = (id: string, data: any) =>
  prisma.lessons.update({ where: { id }, data, include: lessonInclude });

// ================= DELETE =================
export const deleteLessonRepo = (id: string) =>
  prisma.lessons.delete({ where: { id } });
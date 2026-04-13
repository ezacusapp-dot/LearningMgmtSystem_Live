import { prisma } from "@/lib/prisma";

// GET lessons with filter, skip, limit
export const getLessonsRepo = (where: any, skip: number, take: number) => {
  return prisma.lessons.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      module: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

// COUNT lessons
export const countLessonsRepo = (where: any) => {
  return prisma.lessons.count({ where });
};

// FIND by ID
export const findLessonByIdRepo = (id: string) => {
  return prisma.lessons.findUnique({ where: { id } });
};

// CREATE lesson
export const createLessonRepo = (data: any) => {
  return prisma.lessons.create({ data });
};

// UPDATE lesson
export const updateLessonRepo = (id: string, data: any) => {
  return prisma.lessons.update({ where: { id }, data });
};

// DELETE lesson
export const deleteLessonRepo = (id: string) => {
  return prisma.lessons.delete({ where: { id } });
};
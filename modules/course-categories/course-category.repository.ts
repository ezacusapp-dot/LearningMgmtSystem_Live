import { prisma } from "@/lib/prisma";

// CREATE
export const createCategoryRepo = async (data: any) => {
  return prisma.courseCategory.create({
    data,
  });
};

// FIND
export const findCategoryByNameRepo = async (name: string) => {
  return prisma.courseCategory.findFirst({
    where: { name },
  });
};

export const findCategoryByIdRepo = async (id: string) => {
  return prisma.courseCategory.findUnique({
    where: { id },
  });
};

// GET
export const getCategoriesRepo = async (where: any, skip: number, limit: number) => {
  return prisma.courseCategory.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

// COUNT
export const countCategoriesRepo = async (where: any) => {
  return prisma.courseCategory.count({ where });
};

// UPDATE
export const updateCategoryRepo = async (id: string, data: any) => {
  return prisma.courseCategory.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteCategoryRepo = async (id: string) => {
  return prisma.courseCategory.delete({
    where: { id },
  });
};
import { prisma } from "@/lib/prisma";

// CREATE
export const createLevelRepo = async (data: any) => {
  return prisma.courseLevel.create({ data });
};

// FIND BY NAME
export const findLevelByNameRepo = async (name: string) => {
  return prisma.courseLevel.findFirst({
    where: { name },
  });
};

// FIND BY ID
export const findLevelByIdRepo = async (id: string) => {
  return prisma.courseLevel.findUnique({
    where: { id },
  });
};

// GET LIST
export const getLevelsRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.courseLevel.findMany({
    where,
    skip,
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
};

// COUNT
export const countLevelsRepo = async (where: any) => {
  return prisma.courseLevel.count({ where });
};

// GET MAX SORT ORDER
export const getMaxSortOrderRepo = async () => {
  return prisma.courseLevel.aggregate({
    _max: { sortOrder: true },
  });
};

// UPDATE
export const updateLevelRepo = async (id: string, data: any) => {
  return prisma.courseLevel.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteLevelRepo = async (id: string) => {
  return prisma.courseLevel.delete({
    where: { id },
  });
};
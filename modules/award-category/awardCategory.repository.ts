import { prisma } from "@/lib/prisma";

// CREATE
export const createAwardCategoryRepo = async (data: any) => {
  return prisma.awardCategory.create({ data });
};

// FIND BY NAME
export const findAwardCategoryByNameRepo = async (name: string) => {
  return prisma.awardCategory.findFirst({
    where: { name },
  });
};

// FIND BY ID
export const findAwardCategoryByIdRepo = async (id: string) => {
  return prisma.awardCategory.findUnique({
    where: { id },
  });
};

// GET LIST
export const getAwardCategoryRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.awardCategory.findMany({
    where,
    skip,
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
};

// COUNT
export const countAwardCategoryRepo = async (where: any) => {
  return prisma.awardCategory.count({ where });
};

// UPDATE
export const updateAwardCategoryRepo = async (id: string, data: any) => {
  return prisma.awardCategory.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteAwardCategoryRepo = async (id: string) => {
  return prisma.awardCategory.delete({
    where: { id },
  });
};
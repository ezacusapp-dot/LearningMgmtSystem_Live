import { prisma } from "@/lib/prisma";

export const createGradeRepo = async (data: any) => {
  return prisma.grade.create({ data });
};

export const findGradeByNameRepo = async (name: string) => {
  return prisma.grade.findFirst({
    where: { name },
  });
};

export const findGradeByIdRepo = async (id: string) => {
  return prisma.grade.findUnique({
    where: { id },
  });
};

export const getGradeRepo = async (where: any, skip: number, limit: number) => {
  return prisma.grade.findMany({
    where,
    skip,
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
};

export const countGradeRepo = async (where: any) => {
  return prisma.grade.count({ where });
};

export const updateGradeRepo = async (id: string, data: any) => {
  return prisma.grade.update({
    where: { id },
    data,
  });
};

export const deleteGradeRepo = async (id: string) => {
  return prisma.grade.delete({
    where: { id },
  });
};
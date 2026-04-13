import { prisma } from "@/lib/prisma";

// CREATE
export const createValidityRepo = (data: any) => {
  return prisma.validityPeriod.create({ data });
};

// FIND BY NAME
export const findValidityByNameRepo = (name: string) => {
  return prisma.validityPeriod.findFirst({ where: { name } });
};

// FIND BY ID
export const findValidityByIdRepo = (id: string) => {
  return prisma.validityPeriod.findUnique({ where: { id } });
};

// GET LIST
export const getValidityRepo = (where: any, skip: number, limit: number) => {
  return prisma.validityPeriod.findMany({
    where,
    skip,
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
};

// COUNT
export const countValidityRepo = (where: any) => {
  return prisma.validityPeriod.count({ where });
};

// MAX SORT ORDER
export const getMaxSortOrderRepo = () => {
  return prisma.validityPeriod.aggregate({
    _max: { sortOrder: true },
  });
};

// UPDATE
export const updateValidityRepo = (id: string, data: any) => {
  return prisma.validityPeriod.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteValidityRepo = (id: string) => {
  return prisma.validityPeriod.delete({
    where: { id },
  });
};
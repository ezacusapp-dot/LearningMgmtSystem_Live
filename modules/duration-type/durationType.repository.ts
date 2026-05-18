import { prisma } from "@/lib/prisma";

// CREATE
export const createDurationTypeRepo = async (data: any) => {
  return prisma.courseDurationType.create({ data });
};

// DELETE - removed find by name function since no longer needed
export const findDurationTypeByValueAndUnitRepo = async (value: number, unit: string) => {
  return prisma.courseDurationType.findFirst({
    where: { value, unit },
  });
};

// FIND BY ID
export const findDurationTypeByIdRepo = async (id: string) => {
  return prisma.courseDurationType.findUnique({
    where: { id },
  });
};

// GET LIST
export const getDurationTypeRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.courseDurationType.findMany({
    where,
    skip,
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
};

// COUNT
export const countDurationTypeRepo = async (where: any) => {
  return prisma.courseDurationType.count({ where });
};

// UPDATE
export const updateDurationTypeRepo = async (id: string, data: any) => {
  return prisma.courseDurationType.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteDurationTypeRepo = async (id: string) => {
  return prisma.courseDurationType.delete({
    where: { id },
  });
};
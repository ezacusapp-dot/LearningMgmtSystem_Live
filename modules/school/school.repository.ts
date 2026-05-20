import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// CREATE
export const createSchoolRepo = async (data: any) => {
  return prisma.school.create({ data });
};

// FIND BY NAME
export const findSchoolByNameRepo = async (name: string) => {
  return prisma.school.findFirst({
    where: { name },
  });
};

// FIND BY EMAIL
export const findSchoolByEmailRepo = async (adminEmail: string) => {
  return prisma.school.findFirst({
    where: { adminEmail },
  });
};
// school.repository.ts
export const findSchoolByEmailAndRoleRepo = async (adminEmail: string, role: UserRole) => {
  return prisma.school.findFirst({
    where: { adminEmail, role },
  });
};

// FIND BY ID
export const findSchoolByIdRepo = async (id: string) => {
  return prisma.school.findUnique({
    where: { id },
  });
};

// GET LIST
export const getSchoolsRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.school.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

// COUNT
export const countSchoolsRepo = async (where: any) => {
  return prisma.school.count({ where });
};

// UPDATE
export const updateSchoolRepo = async (id: string, data: any) => {
  return prisma.school.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteSchoolRepo = async (id: string) => {
  return prisma.school.delete({
    where: { id },
  });
};
import { prisma } from "@/lib/prisma";


// ================= CREATE =================
export const createCourseRepo = async (data: any) => {
  const {title,categoryId,levelId,duration,description,createdBy, } = data;

  return prisma.courses.create({
    data: {
      title,
      duration,
      description,
      createdBy,

      ...(categoryId && {
        CourseCategory: {
          connect: { id: categoryId },
        },
      }),

      ...(levelId && {
        CourseLevel: {
          connect: { id: levelId },
        },
      }),
    },
  });
};


// ================= FIND =================
export const findCourseByTitleRepo = async (title: string) => {
  return prisma.courses.findFirst({
    where: { title },
  });
};


// ================= GET =================
export const getCoursesRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.courses.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      CourseCategory: {
        select: { id: true, name: true },
      },
      CourseLevel: {
        select: { id: true, name: true },
      },
      Modules: {
        orderBy: { order: "asc" },
      },
    },
  });
};


// ================= COUNT =================
export const countCoursesRepo = async (where: any) => {
  return prisma.courses.count({ where });
};

// UPDATE
export const updateCourseRepo = async (id: string, data: any) => {
  return prisma.courses.update({
    where: { id },
    data,
  });
};

// DELETE
export const deleteCourseRepo = async (id: string) => {
  return prisma.courses.delete({
    where: { id },
  });
};

export const findCourseByIdRepo = async (id: string) => {
  return prisma.courses.findUnique({
    where: { id },
  });
};
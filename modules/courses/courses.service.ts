import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import {
  getCoursesRepo,
  countCoursesRepo,
  findCourseByIdRepo,
  findCourseForEditRepo,
  createCourseRepo,
  updateCourseRepo,
  updateCourseFullRepo,
  deleteCourseRepo,
} from "./courses.repository";

import { CreateCourseDto, UpdateCourseDto } from "./courses.types";

// ─── GET ALL ──────────────────────────────────────────────────────────────────

export const getCoursesService = async (query: any) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const search = query.search || "";
  const status = query.status || undefined;
  const categoryId = query.categoryId || undefined;
  const levelId = query.levelId || undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.CoursesWhereInput = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (levelId) {
    where.levelId = levelId;
  }

  const [total, data] = await Promise.all([
    countCoursesRepo(where),
    getCoursesRepo(where, skip, limit),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getCourseByIdService = async (id: string) => {
  const course = await findCourseByIdRepo(id);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

// ─── GET FULL COURSE FOR EDIT ────────────────────────────────────────────────

export const getCourseForEditService = async (id: string) => {
  const course = await findCourseForEditRepo(id);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createCourseService = async (data: CreateCourseDto) => {
  return createCourseRepo(data);
};

// ─── UPDATE SIMPLE ────────────────────────────────────────────────────────────

export const updateCourseService = async (
  id: string,
  data: UpdateCourseDto
) => {
  const existing = await findCourseByIdRepo(id);

  if (!existing) {
    throw new Error("Course not found");
  }

  return updateCourseRepo(id, data);
};

// ─── FULL UPDATE ──────────────────────────────────────────────────────────────

export const updateCourseFullService = async (
  id: string,
  data: CreateCourseDto
) => {
  const existing = await findCourseByIdRepo(id);

  if (!existing) {
    throw new Error("Course not found");
  }

  return updateCourseFullRepo(id, data);
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteCourseService = async (id: string) => {
  const existing = await findCourseByIdRepo(id);

  if (!existing) {
    throw new Error("Course not found");
  }

  return deleteCourseRepo(id);
};

// ─── GET COURSES BY GRADE WITH FULL DETAILS ──────────────────────────────────

export const getCoursesByGradeWithFullDetailsService = async (
  gradeId: string,
  query: any
) => {
  if (!gradeId) {
    throw new Error("Grade ID is required");
  }

  // Verify grade exists
  const gradeExists = await prisma.grade.findUnique({
    where: {
      id: gradeId,
    },
  });

  if (!gradeExists) {
    throw new Error("Grade not found");
  }

  const page = Number(query.page) > 0 ? Number(query.page) : 1;

  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const search = query.search || "";
  const status = query.status || "Published";
  const categoryId = query.categoryId || undefined;
  const levelId = query.levelId || undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.CoursesWhereInput = {
    grades: {
      some: {
        gradeId,
      },
    },
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (levelId) {
    where.levelId = levelId;
  }

  const [total, data] = await Promise.all([
    prisma.courses.count({
      where,
    }),

    prisma.courses.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

    }),
  ]);

  return {
    data,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

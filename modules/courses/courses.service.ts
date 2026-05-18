

// import {
//   getCoursesRepo,
//   countCoursesRepo,
//   findCourseByIdRepo,
//   createCourseRepo,
//   updateCourseRepo,
//   deleteCourseRepo,
// } from "./courses.repository";
// import { CreateCourseDto, UpdateCourseDto } from "./courses.types";

// // ================= GET COURSES =================
// export const getCoursesService = async (query: any) => {
//   const page   = Number(query.page)  > 0 ? Number(query.page)  : 1;
//   const limit  = Number(query.limit) > 0 ? Number(query.limit) : 10;
//   const search     = query.search     || "";
//   const status     = query.status     || undefined;
//   const categoryId = query.categoryId || undefined;
//   const levelId    = query.levelId    || undefined;

//   const skip = (page - 1) * limit;

//   const where: any = {};
//   if (search)     where.title      = { contains: search, mode: "insensitive" };
//   if (status)     where.status     = status;
//   if (categoryId) where.categoryId = categoryId;
//   if (levelId)    where.levelId    = levelId;

//   const [total, data] = await Promise.all([
//     countCoursesRepo(where),
//     getCoursesRepo(where, skip, limit),
//   ]);

//   return {
//     data,
//     meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//   };
// };

// // ================= GET COURSE BY ID =================
// export const getCourseByIdService = async (id: string) => {
//   const course = await findCourseByIdRepo(id);
//   if (!course) throw new Error("Course not found");
//   return course;
// };

// // ================= CREATE COURSE =================
// export const createCourseService = async (data: CreateCourseDto) =>
//   createCourseRepo(data);

// // ================= UPDATE COURSE =================
// export const updateCourseService = async (id: string, data: UpdateCourseDto) => {
//   const existing = await findCourseByIdRepo(id);
//   if (!existing) throw new Error("Course not found");
//   return updateCourseRepo(id, data);
// };

// // ================= DELETE COURSE =================
// export const deleteCourseService = async (id: string) => {
//   const existing = await findCourseByIdRepo(id);
//   if (!existing) throw new Error("Course not found");
//   return deleteCourseRepo(id);
// };

import { prisma } from "@/lib/prisma";
import {
  getCoursesRepo,
  countCoursesRepo,
  getCoursesByGradeRepo,
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
  const page   = Number(query.page)  > 0 ? Number(query.page)  : 1;
  const limit  = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const search     = query.search     || "";
  const status     = query.status     || undefined;
  const categoryId = query.categoryId || undefined;
  const levelId    = query.levelId    || undefined;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search)     where.title      = { contains: search, mode: "insensitive" };
  if (status)     where.status     = status;
  if (categoryId) where.categoryId = categoryId;
  if (levelId)    where.levelId    = levelId;

  const [total, data] = await Promise.all([
    countCoursesRepo(where),
    getCoursesRepo(where, skip, limit),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getCourseByIdService = async (id: string) => {
  const course = await findCourseByIdRepo(id);
  if (!course) throw new Error("Course not found");
  return course;
};

/** Returns full nested data needed by the edit form */
export const getCourseForEditService = async (id: string) => {
  const course = await findCourseForEditRepo(id);
  if (!course) throw new Error("Course not found");
  return course;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createCourseService = async (data: CreateCourseDto) =>
  createCourseRepo(data);

// ─── UPDATE (simple — scalars only) ──────────────────────────────────────────

export const updateCourseService = async (id: string, data: UpdateCourseDto) => {
  const existing = await findCourseByIdRepo(id);
  if (!existing) throw new Error("Course not found");
  return updateCourseRepo(id, data);
};

/** Full update — replaces modules & grades */
export const updateCourseFullService = async (id: string, data: CreateCourseDto) => {
  const existing = await findCourseByIdRepo(id);
  if (!existing) throw new Error("Course not found");
  return updateCourseFullRepo(id, data);
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteCourseService = async (id: string) => {
  const existing = await findCourseByIdRepo(id);
  if (!existing) throw new Error("Course not found");
  return deleteCourseRepo(id);
};
// In courses.service.ts - add this function

// In courses.service.ts

export const getCoursesByGradeWithFullDetailsService = async (gradeId: string, query: any) => {
  if (!gradeId) throw new Error("Grade ID is required");
  
  // Optional: Verify grade exists
  const gradeExists = await prisma.grade.findUnique({
    where: { id: gradeId }
  });
  
  if (!gradeExists) throw new Error("Grade not found");
  
  return getCoursesByGradeWithFullDetailsRepo(gradeId, query);
};
// import {getLessonsRepo,countLessonsRepo,findLessonByIdRepo,createLessonRepo,updateLessonRepo,deleteLessonRepo,} from "./lessons.repository";

// // ================= GET LESSONS =================
// export const getLessonsService = async (query: any) => {
//   let { page = 1, limit = 10, search = "", moduleId, contentType } = query;

//   page = Number(page) > 0 ? Number(page) : 1;
//   limit = Number(limit) > 0 ? Number(limit) : 10;

//   const skip = (page - 1) * limit;

//   const where: any = {};

//   if (search) {
//     where.title = { contains: search, mode: "insensitive" };
//   }

//   if (moduleId) where.moduleId = moduleId;
//   if (contentType)
//     where.contentType = { equals: contentType, mode: "insensitive" };

//   const total = await countLessonsRepo(where);
//   const data = await getLessonsRepo(where, skip, limit);

//   return {
//     data,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// // ================= CREATE LESSON =================
// export const createLessonService = async (data: any) => {
//   if (!data.moduleId || !data.title || !data.contentType) {
//     throw new Error("Required fields missing");
//   }

//   return createLessonRepo(data);
// };

// // ================= UPDATE LESSON =================
// export const updateLessonService = async (id: string, data: any) => {
//   const existing = await findLessonByIdRepo(id);
//   if (!existing) throw new Error("Lesson not found");

//   return updateLessonRepo(id, data);
// };

// // ================= DELETE LESSON =================
// export const deleteLessonService = async (id: string) => {
//   const existing = await findLessonByIdRepo(id);
//   if (!existing) throw new Error("Lesson not found");

//   return deleteLessonRepo(id);
// };
// ============================================================
// lessons.service.ts
// ============================================================

import {
  getLessonsRepo,
  countLessonsRepo,
  findLessonByIdRepo,
  findLessonByModuleAndOrderRepo,
  createLessonRepo,
  updateLessonRepo,
  deleteLessonRepo,
} from "./lessons.repository";
import { CreateLessonDto, UpdateLessonDto, LessonResponse } from "./lessons.types";

// ─────────────────────────────────────────────────────────────
// Helpers — bridge between frontend (videoLinks[]) and Prisma (fileUrl)
//
//  VIDEO lesson  : videoLinks[0] is stored in fileUrl
//  PDF / DOCUMENT: fileUrl holds the actual file path/name
// ─────────────────────────────────────────────────────────────

/**
 * Converts a raw DTO into a Prisma-safe object.
 * For VIDEO: collapses videoLinks[0] → fileUrl.
 */
function toDbShape(dto: CreateLessonDto | UpdateLessonDto) {
  const { videoLinks, ...rest } = dto as any;

  if (rest.contentType === "VIDEO" && Array.isArray(videoLinks) && videoLinks.length > 0) {
    return { ...rest, fileUrl: videoLinks[0] };
  }

  // PDF / DOCUMENT — fileUrl already in dto; drop videoLinks key
  return rest;
}

/**
 * Converts a Prisma lesson row into the client response shape.
 * For VIDEO: expands fileUrl back into videoLinks[].
 */
export function toClientShape(lesson: any): LessonResponse {
  const { fileUrl, ...rest } = lesson;

  if (lesson.contentType === "VIDEO") {
    return {
      ...rest,
      fileUrl: null,
      videoLinks: fileUrl ? [fileUrl] : [],
    };
  }

  return { ...rest, fileUrl, videoLinks: [] };
}

// ================= GET LESSONS =================
export const getLessonsService = async (query: any) => {
  const page        = Number(query.page)  > 0 ? Number(query.page)  : 1;
  const limit       = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const search      = query.search      || "";
  const moduleId    = query.moduleId    || undefined;
  const contentType = query.contentType || undefined;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search)      where.title       = { contains: search, mode: "insensitive" };
  if (moduleId)    where.moduleId    = moduleId;
  if (contentType) where.contentType = contentType;

  const [total, rows] = await Promise.all([
    countLessonsRepo(where),
    getLessonsRepo(where, skip, limit),
  ]);

  return {
    data: rows.map(toClientShape),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ================= GET LESSON BY ID =================
export const getLessonByIdService = async (id: string) => {
  const lesson = await findLessonByIdRepo(id);
  if (!lesson) throw new Error("Lesson not found");
  return toClientShape(lesson);
};

// ================= CREATE LESSON =================
export const createLessonService = async (dto: CreateLessonDto) => {
  // Validate VIDEO requires at least one link
  if (dto.contentType === "VIDEO" && (!dto.videoLinks || dto.videoLinks.length === 0)) {
    throw new Error("At least one video link is required for VIDEO lessons");
  }

  // Check unique [moduleId, order] if order provided
  if (dto.order !== undefined) {
    const conflict = await findLessonByModuleAndOrderRepo(dto.moduleId, dto.order);
    if (conflict) throw new Error(`A lesson with order ${dto.order} already exists in this module`);
  }

  const row = await createLessonRepo(toDbShape(dto));
  return toClientShape(row);
};

// ================= UPDATE LESSON =================
export const updateLessonService = async (id: string, dto: UpdateLessonDto) => {
  const existing = await findLessonByIdRepo(id);
  if (!existing) throw new Error("Lesson not found");

  const effectiveType = dto.contentType ?? existing.contentType;
  if (effectiveType === "VIDEO" && dto.videoLinks !== undefined && dto.videoLinks.length === 0) {
    throw new Error("VIDEO lesson must have at least one video link");
  }

  // Check order conflict only when order actually changes
  if (dto.order !== undefined && dto.order !== existing.order) {
    const conflict = await findLessonByModuleAndOrderRepo(existing.moduleId, dto.order);
    if (conflict) throw new Error(`A lesson with order ${dto.order} already exists in this module`);
  }

  const row = await updateLessonRepo(id, toDbShape({ ...dto, contentType: effectiveType }));
  return toClientShape(row);
};

// ================= DELETE LESSON =================
export const deleteLessonService = async (id: string) => {
  const existing = await findLessonByIdRepo(id);
  if (!existing) throw new Error("Lesson not found");
  return deleteLessonRepo(id);
};
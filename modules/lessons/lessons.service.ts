import {getLessonsRepo,countLessonsRepo,findLessonByIdRepo,createLessonRepo,updateLessonRepo,deleteLessonRepo,} from "./lessons.repository";

// ================= GET LESSONS =================
export const getLessonsService = async (query: any) => {
  let { page = 1, limit = 10, search = "", moduleId, contentType } = query;

  page = Number(page) > 0 ? Number(page) : 1;
  limit = Number(limit) > 0 ? Number(limit) : 10;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (moduleId) where.moduleId = moduleId;
  if (contentType)
    where.contentType = { equals: contentType, mode: "insensitive" };

  const total = await countLessonsRepo(where);
  const data = await getLessonsRepo(where, skip, limit);

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

// ================= CREATE LESSON =================
export const createLessonService = async (data: any) => {
  if (!data.moduleId || !data.title || !data.contentType) {
    throw new Error("Required fields missing");
  }

  return createLessonRepo(data);
};

// ================= UPDATE LESSON =================
export const updateLessonService = async (id: string, data: any) => {
  const existing = await findLessonByIdRepo(id);
  if (!existing) throw new Error("Lesson not found");

  return updateLessonRepo(id, data);
};

// ================= DELETE LESSON =================
export const deleteLessonService = async (id: string) => {
  const existing = await findLessonByIdRepo(id);
  if (!existing) throw new Error("Lesson not found");

  return deleteLessonRepo(id);
};
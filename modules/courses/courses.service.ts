import {createCourseRepo,findCourseByTitleRepo,getCoursesRepo,countCoursesRepo,updateCourseRepo,deleteCourseRepo,findCourseByIdRepo} from "./courses.repository";


// ================= CREATE =================
export const createCourseService = async (data: any) => {

  // ✅ duplicate check
  const existing = await findCourseByTitleRepo(data.title);

  if (existing) {
    throw new Error("Course already exists");
  }

  return await createCourseRepo(data);
};


// ================= GET =================
export const getCoursesService = async (query: any) => {

  const { page, limit, search, categoryId, levelId } = query;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (categoryId) where.categoryId = categoryId;
  if (levelId) where.levelId = levelId;

  const total = await countCoursesRepo(where);

  const courses = await getCoursesRepo(where, skip, limit);

  return {
    data: courses,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ================= UPDATE =================
export const updateCourseService = async (id: string, data: any) => {
  const existing = await findCourseByIdRepo(id);

  if (!existing) throw new Error("Course not found");

  return updateCourseRepo(id, data);
};

// ================= DELETE =================
export const deleteCourseService = async (id: string) => {
  const existing = await findCourseByIdRepo(id);

  if (!existing) throw new Error("Course not found");

  return deleteCourseRepo(id);
};
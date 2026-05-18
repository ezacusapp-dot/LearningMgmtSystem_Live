import {
  createGradeRepo,
  findGradeByNameRepo,
  findGradeByIdRepo,
  getGradeRepo,
  countGradeRepo,
  updateGradeRepo,
  deleteGradeRepo,
} from "./grade.repository";

// CREATE
export const createGradeService = async (data: any) => {
  const existing = await findGradeByNameRepo(data.name);

  if (existing) {
    throw new Error("Grade already exists");
  }

  return createGradeRepo(data);
};

// GET
export const getGradeService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countGradeRepo(where);
  const data = await getGradeRepo(where, skip, limit);

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

// UPDATE
export const updateGradeService = async (id: string, data: any) => {
  const existing = await findGradeByIdRepo(id);

  if (!existing) throw new Error("Grade not found");

  return updateGradeRepo(id, data);
};

// DELETE
export const deleteGradeService = async (id: string) => {
  const existing = await findGradeByIdRepo(id);

  if (!existing) throw new Error("Grade not found");

  return deleteGradeRepo(id);
};
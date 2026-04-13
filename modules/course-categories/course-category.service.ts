import {
  createCategoryRepo,
  findCategoryByNameRepo,
  getCategoriesRepo,
  countCategoriesRepo,
  updateCategoryRepo,
  deleteCategoryRepo,
  findCategoryByIdRepo,
} from "./course-category.repository";

// CREATE
export const createCategoryService = async (data: any) => {
  const existing = await findCategoryByNameRepo(data.name);

  if (existing) {
    throw new Error("Category already exists");
  }

  return createCategoryRepo(data);
};

// GET
export const getCategoriesService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countCategoriesRepo(where);
  const data = await getCategoriesRepo(where, skip, limit);

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
export const updateCategoryService = async (id: string, data: any) => {
  const existing = await findCategoryByIdRepo(id);

  if (!existing) throw new Error("Category not found");

  return updateCategoryRepo(id, data);
};

// DELETE
export const deleteCategoryService = async (id: string) => {
  const existing = await findCategoryByIdRepo(id);

  if (!existing) throw new Error("Category not found");

  return deleteCategoryRepo(id);
};
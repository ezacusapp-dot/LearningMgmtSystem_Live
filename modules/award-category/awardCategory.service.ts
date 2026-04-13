import {createAwardCategoryRepo,findAwardCategoryByNameRepo,findAwardCategoryByIdRepo,getAwardCategoryRepo,countAwardCategoryRepo,updateAwardCategoryRepo,deleteAwardCategoryRepo,} from "./awardCategory.repository";


// CREATE
export const createAwardCategoryService = async (data: any) => {
  const existing = await findAwardCategoryByNameRepo(data.name);

  if (existing) {
    throw new Error("Award category already exists");
  }

  return createAwardCategoryRepo(data);
};


// GET
export const getAwardCategoryService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countAwardCategoryRepo(where);
  const data = await getAwardCategoryRepo(where, skip, limit);

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
export const updateAwardCategoryService = async (
  id: string,
  data: any
) => {
  const existing = await findAwardCategoryByIdRepo(id);

  if (!existing) throw new Error("Not found");

  return updateAwardCategoryRepo(id, data);
};


// DELETE
export const deleteAwardCategoryService = async (id: string) => {
  const existing = await findAwardCategoryByIdRepo(id);

  if (!existing) throw new Error("Not found");

  return deleteAwardCategoryRepo(id);
};
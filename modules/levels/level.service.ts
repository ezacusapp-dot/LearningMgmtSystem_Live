import {
  createLevelRepo,
  findLevelByNameRepo,
  findLevelByIdRepo,
  getLevelsRepo,
  countLevelsRepo,
  getMaxSortOrderRepo,
  updateLevelRepo,
  deleteLevelRepo,
} from "./level.repository";


// CREATE
export const createLevelService = async (data: any) => {
  const existing = await findLevelByNameRepo(data.name);

  if (existing) {
    throw new Error("Course level already exists");
  }

  const maxOrder = await getMaxSortOrderRepo();

  const finalData = {
    ...data,
    sortOrder:
      data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
  };

  return createLevelRepo(finalData);
};


// GET
export const getLevelsService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = {
    isActive: true,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countLevelsRepo(where);
  const data = await getLevelsRepo(where, skip, limit);

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
export const updateLevelService = async (
  id: string,
  data: any
) => {
  const existing = await findLevelByIdRepo(id);

  if (!existing) throw new Error("Course level not found");

  if (data.name) {
    const duplicate = await findLevelByNameRepo(data.name);

    if (duplicate && duplicate.id !== id) {
      throw new Error("Name already exists");
    }
  }

  return updateLevelRepo(id, data);
};


// DELETE
export const deleteLevelService = async (id: string) => {
  const existing = await findLevelByIdRepo(id);

  if (!existing) throw new Error("Course level not found");

  return deleteLevelRepo(id);
};
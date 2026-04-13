import {
  createValidityRepo,
  findValidityByNameRepo,
  findValidityByIdRepo,
  getValidityRepo,
  countValidityRepo,
  getMaxSortOrderRepo,
  updateValidityRepo,
  deleteValidityRepo,
} from "./validityPeriod.repository";

// CREATE
export const createValidityService = async (data: any) => {
  const existing = await findValidityByNameRepo(data.name);

  if (existing) throw new Error("Validity period already exists");

  const maxOrder = await getMaxSortOrderRepo();

  return createValidityRepo({
    ...data,
    sortOrder:
      data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
  });
};

// GET
export const getValidityService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countValidityRepo(where);
  const data = await getValidityRepo(where, skip, limit);

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
export const updateValidityService = async (
  id: string,
  data: any
) => {
  const existing = await findValidityByIdRepo(id);

  if (!existing) throw new Error("Validity period not found");

  if (data.name) {
    const duplicate = await findValidityByNameRepo(data.name);
    if (duplicate && duplicate.id !== id) {
      throw new Error("Name already exists");
    }
  }

  return updateValidityRepo(id, data);
};

// DELETE
export const deleteValidityService = async (id: string) => {
  const existing = await findValidityByIdRepo(id);

  if (!existing) throw new Error("Validity period not found");

  return deleteValidityRepo(id);
};
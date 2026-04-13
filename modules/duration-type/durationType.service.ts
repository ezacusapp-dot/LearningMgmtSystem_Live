import {createDurationTypeRepo,findDurationTypeByNameRepo,findDurationTypeByIdRepo,getDurationTypeRepo,countDurationTypeRepo,updateDurationTypeRepo,deleteDurationTypeRepo,} from "./durationType.repository";


// CREATE
export const createDurationTypeService = async (data: any) => {
  const existing = await findDurationTypeByNameRepo(data.name);

  if (existing) {
    throw new Error("Duration type already exists");
  }

  return createDurationTypeRepo(data);
};


// GET
export const getDurationTypeService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const total = await countDurationTypeRepo(where);
  const data = await getDurationTypeRepo(where, skip, limit);

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
export const updateDurationTypeService = async (
  id: string,
  data: any
) => {
  const existing = await findDurationTypeByIdRepo(id);

  if (!existing) throw new Error("Duration type not found");

  return updateDurationTypeRepo(id, data);
};


// DELETE
export const deleteDurationTypeService = async (id: string) => {
  const existing = await findDurationTypeByIdRepo(id);

  if (!existing) throw new Error("Duration type not found");

  return deleteDurationTypeRepo(id);
};
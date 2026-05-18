import {
  createDurationTypeRepo,
  findDurationTypeByIdRepo,
  findDurationTypeByValueAndUnitRepo,
  getDurationTypeRepo,
  countDurationTypeRepo,
  updateDurationTypeRepo,
  deleteDurationTypeRepo,
} from "./durationType.repository";

// CREATE
export const createDurationTypeService = async (data: any) => {
  // Check if duration type with same value and unit already exists
  const existing = await findDurationTypeByValueAndUnitRepo(data.value, data.unit);

  if (existing) {
    throw new Error("Duration type with this value and unit already exists");
  }

  return createDurationTypeRepo(data);
};

// GET
export const getDurationTypeService = async (query: any) => {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Updated search to work with value and unit instead of name
  if (search) {
    where.OR = [
      {
        value: {
          equals: parseInt(search) || undefined,
        },
      },
      {
        unit: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
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
export const updateDurationTypeService = async (id: string, data: any) => {
  const existing = await findDurationTypeByIdRepo(id);

  if (!existing) throw new Error("Duration type not found");

  // If updating value and unit, check for duplicates
  if (data.value && data.unit) {
    const duplicate = await findDurationTypeByValueAndUnitRepo(data.value, data.unit);
    if (duplicate && duplicate.id !== id) {
      throw new Error("Duration type with this value and unit already exists");
    }
  }

  return updateDurationTypeRepo(id, data);
};

// DELETE
export const deleteDurationTypeService = async (id: string) => {
  const existing = await findDurationTypeByIdRepo(id);

  if (!existing) throw new Error("Duration type not found");

  return deleteDurationTypeRepo(id);
};
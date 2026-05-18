import bcrypt from "bcrypt";
import {
  createSchoolRepo,
  findSchoolByNameRepo,
  findSchoolByEmailRepo,   // keep if used elsewhere
  findSchoolByEmailAndRoleRepo, // add this
  findSchoolByIdRepo,
  getSchoolsRepo,
  countSchoolsRepo,
  updateSchoolRepo,
  deleteSchoolRepo,
} from "./school.repository";

const SALT_ROUNDS = 10;

// Helper to exclude password from returned object
const excludePassword = (school: any) => {
  if (!school) return school;
  const { password, ...rest } = school;
  return rest;
};

// CREATE - with password hashing
// school.service.ts

export const createSchoolService = async (data: any) => {
  const existingName = await findSchoolByNameRepo(data.name);
  if (existingName) throw new Error("School with this name already exists");

  const existingEmail = await findSchoolByEmailRepo(data.adminEmail);
  if (existingEmail) throw new Error("School with this admin email already exists");

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  // ✅ ADD THIS LINE – explicitly set role (optional because Prisma default already does it)
  const createData = { 
    ...data, 
    password: hashedPassword,
    role: "SCHOOL_ADMIN"    // <-- HERE
  };

  const created = await createSchoolRepo(createData);
  return excludePassword(created);
};

// GET ALL - automatically exclude password inside controller (we'll do it there too)
export const getSchoolsService = async (query: any) => {
  const { page, limit, search, region, state, subscription, active } = query;
  const skip = (page - 1) * limit;
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { adminName: { contains: search, mode: "insensitive" } },
      { adminEmail: { contains: search, mode: "insensitive" } },
    ];
  }
  if (region) where.region = region;
  if (state) where.state = state;
  if (subscription) where.subscription = subscription;
  if (typeof active === "boolean") where.active = active;

  const total = await countSchoolsRepo(where);
  let data = await getSchoolsRepo(where, skip, limit);
  // Exclude password from each school (can also be done in repo but here for clarity)
  data = data.map(excludePassword);

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

// GET BY ID
export const getSchoolByIdService = async (id: string) => {
  const school = await findSchoolByIdRepo(id);
  if (!school) throw new Error("School not found");
  return excludePassword(school);
};

// UPDATE - with optional password hashing
export const updateSchoolService = async (id: string, data: any) => {
  const existing = await findSchoolByIdRepo(id);
  if (!existing) throw new Error("School not found");

  if (data.name && data.name !== existing.name) {
    const nameConflict = await findSchoolByNameRepo(data.name);
    if (nameConflict) throw new Error("School with this name already exists");
  }

  if (data.adminEmail && data.adminEmail !== existing.adminEmail) {
    const emailConflict = await findSchoolByEmailRepo(data.adminEmail);
    if (emailConflict) throw new Error("School with this admin email already exists");
  }

  // Hash new password if provided
  let updateData = { ...data };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  const updated = await updateSchoolRepo(id, updateData);
  return excludePassword(updated);
};

// DELETE
export const deleteSchoolService = async (id: string) => {
  const existing = await findSchoolByIdRepo(id);
  if (!existing) throw new Error("School not found");
  return deleteSchoolRepo(id);
};

// ✅ LOGIN SERVICE
// ✅ LOGIN SERVICE with role check
export const loginSchoolService = async (adminEmail: string, password: string) => {
  const school = await findSchoolByEmailAndRoleRepo(adminEmail, "SCHOOL_ADMIN");
  if (!school) throw new Error("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, school.password);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  return excludePassword(school);
};
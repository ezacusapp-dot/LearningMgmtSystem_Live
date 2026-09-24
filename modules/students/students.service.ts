
// students.service.ts
import bcrypt from "bcrypt";
import {
  createStudentRepo,
  findStudentByUsernameRepo,
  findStudentByIdRepo,
  getStudentRepo,
  countStudentRepo,
  updateStudentRepo,
  deleteStudentRepo,
  findSchoolByIdRepo,
} from "./students.repository";

const SALT_ROUNDS = 10;

const excludePassword = (student: any) => {
  if (!student) return student;
  const { password, ...rest } = student;
  return rest;
};

// Every student must point to an existing, active school
const assertSchoolValid = async (schoolId?: string) => {
  if (!schoolId) throw new Error("School is required");

  const school = await findSchoolByIdRepo(schoolId);
  if (!school) throw new Error("Selected school does not exist");
  if (!school.active) throw new Error("Selected school is inactive");
};

/* ═══════════════════════════════════════
   CREATE
═══════════════════════════════════════ */
export const createStudentService = async (data: any) => {
  const existingUsername = await findStudentByUsernameRepo(data.username);
  if (existingUsername) {
    throw new Error("Username already exists. Please choose another.");
  }

  // Student can only be saved against a valid school
  await assertSchoolValid(data.schoolId);

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const created = await createStudentRepo({
    ...data,
    password: hashedPassword,
    role: "STUDENT",
  });

  return excludePassword(created);
};

/* ═══════════════════════════════════════
   GET LIST
═══════════════════════════════════════ */
export const getStudentService = async (query: any) => {
  const { page, limit, search, standard, batch, schoolId } = query;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (search) {
    where.OR = [
      { firstName:    { contains: search, mode: "insensitive" } },
      { lastName:     { contains: search, mode: "insensitive" } },
      { username:     { contains: search, mode: "insensitive" } },
      { studentEmail: { contains: search, mode: "insensitive" } },
      { parentMobile: { contains: search } },
    ];
  }

  if (standard) where.standard = standard;
  if (batch)    where.batch    = batch;
  if (schoolId) where.schoolId = schoolId;

  const total = await countStudentRepo(where);
  const rows = await getStudentRepo(where, skip, limit);
  const data = rows.map(excludePassword);

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

/* ═══════════════════════════════════════
   UPDATE
═══════════════════════════════════════ */
// export const updateStudentService = async (id: string, data: any) => {
//   const numId = parseInt(id);
//   const existing = await findStudentByIdRepo(numId);
//   if (!existing) throw new Error("Student not found");

//   if (data.username && data.username !== existing.username) {
//     const taken = await findStudentByUsernameRepo(data.username);
//     if (taken) throw new Error("Username already exists. Please choose another.");
//   }

//   const updateData: any = { ...data };

//   if (updateData.password) {
//     updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
//   }

//   // School can be changed, but never cleared, and must be valid
//   if ("schoolId" in updateData) {
//     if (!updateData.schoolId) {
//       delete updateData.schoolId;
//     } else if (updateData.schoolId !== existing.schoolId) {
//       await assertSchoolValid(updateData.schoolId);
//     }
//   }

//   const updated = await updateStudentRepo(numId, updateData, existing.schoolId);
//   return excludePassword(updated);
// };

// /* ═══════════════════════════════════════
//    DELETE
// ═══════════════════════════════════════ */
// export const deleteStudentService = async (id: string) => {
//   const numId = parseInt(id);
//   const existing = await findStudentByIdRepo(numId);
//   if (!existing) throw new Error("Student not found");

//   await deleteStudentRepo(numId, existing.schoolId);
// };

/* ═══════════════════════════════════════
   UPDATE
═══════════════════════════════════════ */
/* ═══════════════════════════════════════
   UPDATE
   callerSchoolId: the caller's schoolId to enforce ownership
   (school-admin route), or null to bypass the check (admin route).
═══════════════════════════════════════ */
export const updateStudentService = async (
  id: string,
  data: any,
  callerSchoolId: string | null
) => {
  const numId = parseInt(id);
  const existing = await findStudentByIdRepo(numId);
  if (!existing) throw new Error("Student not found");

  // Only enforce ownership when a real schoolId was supplied.
  if (callerSchoolId !== null && existing.schoolId !== callerSchoolId) {
    throw new Error("Student not found");
  }

  if (data.username && data.username !== existing.username) {
    const taken = await findStudentByUsernameRepo(data.username);
    if (taken) throw new Error("Username already exists. Please choose another.");
  }

  const updateData: any = { ...data };

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  if (callerSchoolId !== null) {
    // School-admin path: schoolId can never be reassigned through this route.
    delete updateData.schoolId;
  } else if (updateData.schoolId) {
    // Admin path: schoolId can be reassigned, but must point to a real, active school.
    await assertSchoolValid(updateData.schoolId);
  }

  const updated = await updateStudentRepo(numId, updateData, existing.schoolId);
  return excludePassword(updated);
};

/* ═══════════════════════════════════════
   DELETE
═══════════════════════════════════════ */
export const deleteStudentService = async (
  id: string,
  callerSchoolId: string | null
) => {
  const numId = parseInt(id);
  const existing = await findStudentByIdRepo(numId);
  if (!existing) throw new Error("Student not found");

  if (callerSchoolId !== null && existing.schoolId !== callerSchoolId) {
    throw new Error("Student not found");
  }

  await deleteStudentRepo(numId, existing.schoolId);
};

/* ═══════════════════════════════════════
   GET BY ID
═══════════════════════════════════════ */
export const getStudentByIdService = async (id: string) => {
  const numId = parseInt(id);
  const student = await findStudentByIdRepo(numId);
  if (!student) throw new Error("Student not found");
  return excludePassword(student);
};

/* ═══════════════════════════════════════
   LOGIN SERVICE
═══════════════════════════════════════ */
export const loginStudentService = async (username: string, password: string) => {
  const student = await findStudentByUsernameRepo(username);
  if (!student) throw new Error("Invalid username or password");

  const isPasswordValid = await bcrypt.compare(password, student.password);
  if (!isPasswordValid) throw new Error("Invalid username or password");

  return excludePassword(student);
};
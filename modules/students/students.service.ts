// students.service.ts
import bcrypt from "bcrypt" // Use bcrypt (consistent with school service)
import {
  createStudentRepo,
  findStudentByUsernameRepo,
  findStudentByIdRepo,
  getStudentRepo,
  countStudentRepo,
  updateStudentRepo,
  deleteStudentRepo,
} from "./students.repository";

const SALT_ROUNDS = 10;

// Helper to exclude password from returned object (optional)
const excludePassword = (student: any) => {
  if (!student) return student;
  const { password, ...rest } = student;
  return rest;
};

/* ═══════════════════════════════════════
   CREATE - with password hashing
═══════════════════════════════════════ */
export const createStudentService = async (data: any) => {
  // ── Duplicate username check ──
  const existingUsername = await findStudentByUsernameRepo(data.username);
  if (existingUsername) throw new Error("Username already exists. Please choose another.");

  // Hash the password before storing (same as school service)
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  const createData = {
    ...data,
    password: hashedPassword,
    role: "STUDENT",  // Explicitly set role (matches your schema default)
  };
  
  const created = await createStudentRepo(createData);
  return excludePassword(created);  // Return without password
};

/* ═══════════════════════════════════════
   GET LIST
═══════════════════════════════════════ */
export const getStudentService = async (query: any) => {
  const { page, limit, search, standard, batch } = query;

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

  const total = await countStudentRepo(where);
  let data = await getStudentRepo(where, skip, limit);
  
  // Exclude passwords from all students
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

/* ═══════════════════════════════════════
   UPDATE - with optional password hashing
═══════════════════════════════════════ */
export const updateStudentService = async (id: string, data: any) => {
  const numId    = parseInt(id);
  const existing = await findStudentByIdRepo(numId);
  if (!existing) throw new Error("Student not found");

  // ── If username is being changed, check it's not taken by another student ──
  if (data.username && data.username !== existing.username) {
    const taken = await findStudentByUsernameRepo(data.username);
    if (taken) throw new Error("Username already exists. Please choose another.");
  }

  // Hash new password if provided
  let updateData = { ...data };
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  const updated = await updateStudentRepo(numId, updateData);
  return excludePassword(updated);
};

/* ═══════════════════════════════════════
   DELETE
═══════════════════════════════════════ */
export const deleteStudentService = async (id: string) => {
  const numId    = parseInt(id);
  const existing = await findStudentByIdRepo(numId);
  if (!existing) throw new Error("Student not found");
  return deleteStudentRepo(numId);
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
   LOGIN SERVICE (if needed for students)
═══════════════════════════════════════ */
export const loginStudentService = async (username: string, password: string) => {
  const student = await findStudentByUsernameRepo(username);
  if (!student) throw new Error("Invalid username or password");

  const isPasswordValid = await bcrypt.compare(password, student.password);
  if (!isPasswordValid) throw new Error("Invalid username or password");

  return excludePassword(student);
};
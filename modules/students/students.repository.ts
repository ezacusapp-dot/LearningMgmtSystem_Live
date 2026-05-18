


// import { prisma } from "@/lib/prisma";

// /* ================= CREATE ================= */
// export const createStudentRepo = async (data: any) => {
//   return prisma.student.create({
//     data,
//   });
// };

// /* ================= FIND BY ID ================= */
// export const findStudentByIdRepo = async (id: number) => {  // ✅ Keep as number
//   return prisma.student.findUnique({
//     where: { id },
//   });
// };

// /* ================= FIND BY MOBILE ================= */
// export const findStudentByMobileRepo = async (studentMobile: string) => {
//   return prisma.student.findFirst({
//     where: {
//       studentMobile,
//     },
//   });
// };

// /* ================= FIND BY EMAIL ================= */
// export const findStudentByEmailRepo = async (studentEmail: string) => {
//   return prisma.student.findFirst({
//     where: {
//       studentEmail,
//     },
//   });
// };

// /* ================= GET LIST ================= */
// export const getStudentRepo = async (
//   where: any,
//   skip: number,
//   limit: number
// ) => {
//   return prisma.student.findMany({
//     where,
//     skip,
//     take: limit,
//     orderBy: { createdAt: "desc" },
//   });
// };

// /* ================= COUNT ================= */
// export const countStudentRepo = async (where: any) => {
//   return prisma.student.count({ where });
// };

// /* ================= UPDATE ================= */
// export const updateStudentRepo = async (
//   id: number,
//   data: any
// ) => {
//   return prisma.student.update({
//     where: { id },
//     data,
//   });
// };

// /* ================= DELETE ================= */
// export const deleteStudentRepo = async (id: number) => {
//   return prisma.student.delete({
//     where: { id },
//   });
// };


import { prisma } from "@/lib/prisma";

/* ═══════════════════════════════════════
   CREATE
═══════════════════════════════════════ */
export const createStudentRepo = async (data: any) => {
  return prisma.student.create({ data });
};

/* ═══════════════════════════════════════
   FIND BY ID
═══════════════════════════════════════ */
export const findStudentByIdRepo = async (id: number) => {
  return prisma.student.findUnique({ where: { id } });
};

/* ═══════════════════════════════════════
   FIND BY USERNAME  ← new
═══════════════════════════════════════ */
export const findStudentByUsernameRepo = async (username: string) => {
  return prisma.student.findUnique({ where: { username } });
};

/* ═══════════════════════════════════════
   FIND BY MOBILE  (kept for legacy use)
═══════════════════════════════════════ */
export const findStudentByMobileRepo = async (studentMobile: string) => {
  return prisma.student.findFirst({ where: { studentMobile } });
};

/* ═══════════════════════════════════════
   FIND BY EMAIL
═══════════════════════════════════════ */
export const findStudentByEmailRepo = async (studentEmail: string) => {
  return prisma.student.findFirst({ where: { studentEmail } });
};

/* ═══════════════════════════════════════
   GET LIST
═══════════════════════════════════════ */
export const getStudentRepo = async (
  where: any,
  skip: number,
  limit: number
) => {
  return prisma.student.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

/* ═══════════════════════════════════════
   COUNT
═══════════════════════════════════════ */
export const countStudentRepo = async (where: any) => {
  return prisma.student.count({ where });
};

/* ═══════════════════════════════════════
   UPDATE
═══════════════════════════════════════ */
export const updateStudentRepo = async (id: number, data: any) => {
  return prisma.student.update({ where: { id }, data });
};

/* ═══════════════════════════════════════
   DELETE
═══════════════════════════════════════ */
export const deleteStudentRepo = async (id: number) => {
  return prisma.student.delete({ where: { id } });
};

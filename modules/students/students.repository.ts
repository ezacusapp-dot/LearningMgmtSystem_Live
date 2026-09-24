
import { prisma } from "@/lib/prisma";

// Small, reusable select so every read includes the linked school's
// id + name without pulling the whole School row.
const withSchool = {
  school: {
    select: { id: true, name: true },
  },
};

/* ═══════════════════════════════════════
   SCHOOL LOOKUP (used to validate schoolId)
═══════════════════════════════════════ */
export const findSchoolByIdRepo = async (id: string) => {
  return prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, active: true },
  });
};

/* ═══════════════════════════════════════
   CREATE  (student + school counter, atomic)
═══════════════════════════════════════ */
export const createStudentRepo = async (data: any) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.create({
      data,
      include: withSchool,
    });

    await tx.school.update({
      where: { id: data.schoolId },
      data: { students: { increment: 1 } },
    });

    return student;
  });
};

/* ═══════════════════════════════════════
   FIND BY ID
═══════════════════════════════════════ */
export const findStudentByIdRepo = async (id: number) => {
  return prisma.student.findUnique({
    where: { id },
    include: withSchool,
  });
};

/* ═══════════════════════════════════════
   FIND BY USERNAME
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
    include: withSchool,
  });
};

/* ═══════════════════════════════════════
   COUNT
═══════════════════════════════════════ */
export const countStudentRepo = async (where: any) => {
  return prisma.student.count({ where });
};

/* ═══════════════════════════════════════
   UPDATE  (moves school counters if school changed)
═══════════════════════════════════════ */
export const updateStudentRepo = async (
  id: number,
  data: any,
  oldSchoolId?: string | null
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id },
      data,
      include: withSchool,
    });

    // Only move counters when the school actually changed
    if (data.schoolId && data.schoolId !== oldSchoolId) {
      if (oldSchoolId) {
        await tx.school.update({
          where: { id: oldSchoolId },
          data: { students: { decrement: 1 } },
        });
      }
      await tx.school.update({
        where: { id: data.schoolId },
        data: { students: { increment: 1 } },
      });
    }

    return student;
  });
};

export const deleteStudentRepo = async (id: number, schoolId?: string | null) => {
  return prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id } });

    if (schoolId) {
      await tx.school.update({
        where: { id: schoolId },
        data: { students: { decrement: 1 } },
      });
    }
  });
};
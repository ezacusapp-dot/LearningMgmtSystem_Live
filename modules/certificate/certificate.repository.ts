import { prisma } from "@/lib/prisma";
import { Prisma, CertificateStatus } from "@prisma/client";
import type { CertificateListQuery } from "./certificate.types";

export const certificateRepository = {
  async findCourseWithCategory(courseId: string) {
    return prisma.courses.findUnique({
      where: { id: courseId },
      include: { courseCategory: true },
    });
  },

async findTemplateByCourse(courseId: string) {
  return prisma.certificateTemplate.findUnique({
    where: { courseId },
  });
},
  async findStudentById(studentId: number) {
    return prisma.student.findUnique({ where: { id: studentId } });
  },

  async findExamAttemptById(examAttemptId: string) {
    return prisma.examAttempt.findUnique({
      where: { id: examAttemptId },
      include: { exam: true },
    });
  },

  async findExistingByStudentAndCourse(studentId: number, courseId: string) {
    return prisma.certificate.findFirst({
      where: { studentId, courseId, status: { not: "Revoked" } },
    });
  },

  async countAll(): Promise<number> {
    return prisma.certificate.count();
  },

  async create(data: Prisma.CertificateCreateInput) {
    return prisma.certificate.create({ data });
  },

  async findById(id: string) {
    return prisma.certificate.findUnique({ where: { id } });
  },

  async findByCertificateNumber(certificateNumber: string) {
    return prisma.certificate.findUnique({ where: { certificateNumber } });
  },

  async findMany(query: CertificateListQuery) {
    const { studentId, courseId, status, page = 1, pageSize = 20 } = query;

    const where: Prisma.CertificateWhereInput = {
      ...(studentId ? { studentId } : {}),
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.certificate.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  async revoke(id: string, reason: string) {
    return prisma.certificate.update({
      where: { id },
      data: {
        status: CertificateStatus.Revoked,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  },
};
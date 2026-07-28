// modules/exam-certificate-issuance/examCertificateIssuance.repository.ts

import { prisma } from "@/lib/prisma";

export const examCertificateIssuanceRepository = {
  async findAttemptForStudent(attemptId: string, studentId: number) {
    return prisma.examAttempt.findFirst({
      where: { id: attemptId, studentId },
      include: { exam: true },
    });
  },

  async findExistingCertificate(attemptId: string) {
    return prisma.examCertificate.findUnique({
      where: { attemptId },
      include: { band: true, exam: true },
    });
  },

  async findStudent(studentId: number) {
    return prisma.student.findUnique({ where: { id: studentId } });
  },

  async create(data: {
    certificateNumber: string;
    score: number;
    percentage: number;
    isPassed: boolean;
    certificateName: string;
    designation: string;
    colorCode: string;
    studentNameSnapshot: string;
    examTitleSnapshot: string;
    studentId: number;
    examId: string;
    attemptId: string;
    bandId: string;
  }) {
    return prisma.examCertificate.create({
      data: {
        certificateNumber: data.certificateNumber,
        score: data.score,
        percentage: data.percentage,
        isPassed: data.isPassed,
        certificateName: data.certificateName,
        designation: data.designation,
        colorCode: data.colorCode,
        studentNameSnapshot: data.studentNameSnapshot,
        examTitleSnapshot: data.examTitleSnapshot,
        student: { connect: { id: data.studentId } },
        exam: { connect: { id: data.examId } },
        attempt: { connect: { id: data.attemptId } },
        band: { connect: { id: data.bandId } },
      },
    });
  },

  async listForStudent(studentId: number) {
    return prisma.examCertificate.findMany({
      where: { studentId },
      include: { exam: true, band: true },
      orderBy: { issuedAt: "desc" },
    });
  },
};
// // modules/exam-certificate-issuance/examCertificateIssuance.repository.ts

// import { prisma } from "@/lib/prisma";

// export const examCertificateIssuanceRepository = {
//   async findAttemptForStudent(attemptId: string, studentId: number) {
//     return prisma.examAttempt.findFirst({
//       where: { id: attemptId, studentId },
//       include: { exam: true },
//     });
//   },

//   async findExistingCertificate(attemptId: string) {
//     return prisma.examCertificate.findUnique({
//       where: { attemptId },
//       include: { band: true, exam: true },
//     });
//   },

//   async findStudent(studentId: number) {
//     return prisma.student.findUnique({ where: { id: studentId } });
//   },

//   async create(data: {
//     certificateNumber: string;
//     score: number;
//     percentage: number;
//     isPassed: boolean;
//     certificateName: string;
//     designation: string;
//     colorCode: string;
//     studentNameSnapshot: string;
//     examTitleSnapshot: string;
//     studentId: number;
//     examId: string;
//     attemptId: string;
//     bandId: string;
//   }) {
//     return prisma.examCertificate.create({
//       data: {
//         certificateNumber: data.certificateNumber,
//         score: data.score,
//         percentage: data.percentage,
//         isPassed: data.isPassed,
//         certificateName: data.certificateName,
//         designation: data.designation,
//         colorCode: data.colorCode,
//         studentNameSnapshot: data.studentNameSnapshot,
//         examTitleSnapshot: data.examTitleSnapshot,
//         student: { connect: { id: data.studentId } },
//         exam: { connect: { id: data.examId } },
//         attempt: { connect: { id: data.attemptId } },
//         band: { connect: { id: data.bandId } },
//       },
//     });
//   },

//   async listForStudent(studentId: number) {
//     return prisma.examCertificate.findMany({
//       where: { studentId },
//       include: { exam: true, band: true },
//       orderBy: { issuedAt: "desc" },
//     });
//   },
// };

// modules/exam-certificate-issuance/examCertificateIssuance.repository.ts

import { prisma } from "@/lib/prisma";

export const examCertificateIssuanceRepository = {
  /**
   * Finds an attempt belonging to this student.
   *
   * BACKWARD-COMPAT FALLBACK (no schema change):
   * Older submissions may have been written before `studentId` (Int?) was
   * populated, using only the legacy `userId` (String?) field. Rather than
   * requiring a data migration, we:
   *   1. First try the fast, correct path: match on studentId directly.
   *   2. If that misses, fall back to matching on userId as the
   *      stringified student id (the shape the old submission code wrote).
   *   3. If we find it via the fallback, self-heal the row by writing
   *      studentId onto it, so every future lookup (and any other query
   *      that filters by studentId) works directly from then on.
   */
  async findAttemptForStudent(attemptId: string, studentId: number) {
    const direct = await prisma.examAttempt.findFirst({
      where: { id: attemptId, studentId },
      include: { exam: true },
    });
    if (direct) return direct;

    // Fallback: match on legacy userId field (stored as a string).
    const fallback = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId: String(studentId),
      },
      include: { exam: true },
    });
    if (!fallback) return null;

    // Self-heal: backfill studentId so future queries don't need the
    // fallback path. Safe no-op if studentId was already correct.
    const healed = await prisma.examAttempt.update({
      where: { id: fallback.id },
      data: { studentId },
      include: { exam: true },
    });

    return healed;
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
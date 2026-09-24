import { prisma } from "@/lib/prisma";

export const certificateIssuanceRepository = {
  async findExistingCertificate(studentId: number, courseId: string) {
    return prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  },

  async findTemplateForCourse(courseId: string) {
    return prisma.certificateTemplate.findUnique({ where: { courseId } });
  },

  async findStudent(studentId: number) {
    return prisma.student.findUnique({ where: { id: studentId } });
  },

  async findCourse(courseId: string) {
    return prisma.courses.findUnique({ where: { id: courseId } });
  },

  async findModulesWithProgress(studentId: number, courseId: string) {
    return prisma.modules.findMany({
      where: { courseId, isActive: true },
      include: { progress: { where: { studentId } } },
    });
  },

  /**
   * Returns the best passing attempt on the course's FINAL_QUIZ, with
   * `totalMarks` attached so the service can compute a correct percentage
   * instead of treating the raw score as one.
   */
  async findFinalQuizAttempt(studentId: number, courseId: string) {
    const finalModule = await prisma.modules.findFirst({
      where: { courseId, type: "FINAL_QUIZ", isActive: true },
      include: { quiz: true },
    });
    if (!finalModule?.quiz) return null;

    const attempt = await prisma.studentQuizAttempt.findFirst({
      where: { studentId, quizId: finalModule.quiz.id, isPassed: true },
      orderBy: { score: "desc" },
    });
    if (!attempt) return null;

    return { ...attempt, totalMarks: finalModule.quiz.totalMarks };
  },

  // pdfUrl is optional — checkAndIssueCertificate doesn't pass it, so the
  // row is created with pdfUrl: null until the student downloads. status is
  // explicitly "Issued" because listForStudent() filters on it.
  async createCertificate(data: {
    certificateNumber: string;
    score: number;
    percentage: number;
    grade: string;
    studentNameSnapshot: string;
    courseNameSnapshot: string;
    pdfUrl?: string | null;
    studentId: number;
    courseId: string;
    templateId: string;
  }) {
    return prisma.certificate.create({
      data: {
        certificateNumber: data.certificateNumber,
        score: data.score,
        percentage: data.percentage,
        grade: data.grade,
        studentNameSnapshot: data.studentNameSnapshot,
        courseNameSnapshot: data.courseNameSnapshot,
        pdfUrl: data.pdfUrl ?? null,
        status: "Issued",
        student: { connect: { id: data.studentId } },
        course: { connect: { id: data.courseId } },
        template: { connect: { id: data.templateId } },
      },
    });
  },

  async updateCertificatePdfUrl(id: string, pdfUrl: string) {
    return prisma.certificate.update({
      where: { id },
      data: { pdfUrl },
    });
  },

  async listForStudent(studentId: number) {
    return prisma.certificate.findMany({
      where: { studentId, status: "Issued" },
      include: { course: true, template: true },
      orderBy: { issuedAt: "desc" },
    });
  },

  async findByIdForStudent(id: string, studentId: number) {
    return prisma.certificate.findFirst({
      where: { id, studentId },
    });
  },
};
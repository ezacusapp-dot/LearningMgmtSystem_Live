// // modules/certificate-issuance/certificateIssuance.repository.ts

// import { prisma } from "@/lib/prisma";

// export const certificateIssuanceRepository = {
//   async findExistingCertificate(studentId: number, courseId: string) {
//     return prisma.certificate.findUnique({
//       where: { studentId_courseId: { studentId, courseId } },
//     });
//   },

//   async findTemplateForCourse(courseId: string) {
//     return prisma.certificateTemplate.findUnique({ where: { courseId } });
//   },

//   async findStudent(studentId: number) {
//     return prisma.student.findUnique({ where: { id: studentId } });
//   },

//   async findCourse(courseId: string) {
//     return prisma.courses.findUnique({ where: { id: courseId } });
//   },

//   /** All active modules for a course, with this student's progress row (if any). */
//   async findModulesWithProgress(studentId: number, courseId: string) {
//     return prisma.modules.findMany({
//       where: { courseId, isActive: true },
//       include: {
//         progress: { where: { studentId } },
//       },
//     });
//   },

//   /** Best/most recent passed quiz attempt for a course's final quiz module, if any. */
//   async findFinalQuizAttempt(studentId: number, courseId: string) {
//     const finalModule = await prisma.modules.findFirst({
//       where: { courseId, type: "FINAL_QUIZ", isActive: true },
//       include: { quiz: true },
//     });
//     if (!finalModule?.quiz) return null;

//     return prisma.studentQuizAttempt.findFirst({
//       where: { studentId, quizId: finalModule.quiz.id, isPassed: true },
//       orderBy: { score: "desc" },
//     });
//   },

//   async createCertificate(data: {
//     certificateNumber: string;
//     score: number;
//     percentage: number;
//     grade: string;
//     studentNameSnapshot: string;
//     courseNameSnapshot: string;
//     pdfUrl: string;
//     studentId: number;
//     courseId: string;
//     templateId: string;
//   }) {
//     return prisma.certificate.create({
//       data: {
//         certificateNumber: data.certificateNumber,
//         score: data.score,
//         percentage: data.percentage,
//         grade: data.grade,
//         studentNameSnapshot: data.studentNameSnapshot,
//         courseNameSnapshot: data.courseNameSnapshot,
//         pdfUrl: data.pdfUrl,
//         student: { connect: { id: data.studentId } },
//         course: { connect: { id: data.courseId } },
//         template: { connect: { id: data.templateId } },
//       },
//     });
//   },

//   async listForStudent(studentId: number) {
//     return prisma.certificate.findMany({
//       where: { studentId, status: "Issued" },
//       include: { course: true, template: true },
//       orderBy: { issuedAt: "desc" },
//     });
//   },

//   async findByIdForStudent(id: string, studentId: number) {
//     return prisma.certificate.findFirst({
//       where: { id, studentId },
//     });
//   },
// };
// modules/certificate-issuance/certificateIssuance.repository.ts
// modules/certificate-issuance/certificateIssuance.repository.ts

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

  async findFinalQuizAttempt(studentId: number, courseId: string) {
    const finalModule = await prisma.modules.findFirst({
      where: { courseId, type: "FINAL_QUIZ", isActive: true },
      include: { quiz: true },
    });
    if (!finalModule?.quiz) return null;

    return prisma.studentQuizAttempt.findFirst({
      where: { studentId, quizId: finalModule.quiz.id, isPassed: true },
      orderBy: { score: "desc" },
    });
  },

  // 🔑 pdfUrl is optional — checkAndIssueCertificate no longer passes it,
  // so the row is created with pdfUrl: null until the student downloads.
  //
  // 🔑 status is now explicitly set to "Issued" on creation. Previously
  // this was omitted, which meant every new row fell back to whatever the
  // Prisma schema's default is for Certificate.status — NOT "Issued". Since
  // listForStudent() (used by the /student/certificates page) filters on
  // status: "Issued", every certificate ever created was silently excluded
  // from that list even though issuance itself succeeded and the progress
  // endpoint (which doesn't filter on status) could see it fine.
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

  // 🔑 Called once, the first time a certificate is downloaded, to persist
  // the pdfUrl produced by the lazy Puppeteer render.
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
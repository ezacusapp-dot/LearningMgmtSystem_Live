
// // modules/certificate-issuance/certificateIssuance.service.ts

// import { certificateIssuanceRepository as repo } from "./certificateIssuance.repository";
// import { generateCertificateNumber } from "./certificateNumber.util";
// import { renderCertificatePdf } from "./certificatePdf.service";

// export class CertificateIssuanceError extends Error {}

// function gradeFromPercentage(pct: number): string {
//   if (pct >= 90) return "A+";
//   if (pct >= 80) return "A";
//   if (pct >= 70) return "B";
//   if (pct >= 60) return "C";
//   return "D";
// }

// export async function isCourseCompletedByStudent(
//   studentId: number,
//   courseId: string
// ): Promise<boolean> {
//   const modules = await repo.findModulesWithProgress(studentId, courseId);
//   const gradableModules = modules.filter((m) => m.type !== "REVISION");
//   if (gradableModules.length === 0) return false;

//   return gradableModules.every((m) => m.progress.some((p) => p.isCompleted));
// }

// /**
//  * Call this any time a student's progress changes. It's a no-op unless the
//  * course is now fully complete and no certificate row exists yet.
//  *
//  * IMPORTANT: this ONLY creates the certificate *record* (number, grade,
//  * name/course snapshots). It deliberately does NOT call renderCertificatePdf
//  * — that's the slow Puppeteer step, and we don't want every lesson/quiz
//  * completion paying that cost. The PDF is rendered lazily, on first
//  * download, by ensureCertificatePdf() below. pdfUrl stays null until then.
//  */
// export async function checkAndIssueCertificate(studentId: number, courseId: string) {
//   const existing = await repo.findExistingCertificate(studentId, courseId);
//   if (existing) return existing; // already issued — nothing to do

//   const completed = await isCourseCompletedByStudent(studentId, courseId);
//   if (!completed) return null;

//   const template = await repo.findTemplateForCourse(courseId);
//   if (!template) {
//     console.warn(`Course ${courseId} completed but has no certificate template configured.`);
//     return null;
//   }

//   const [student, course, finalAttempt] = await Promise.all([
//     repo.findStudent(studentId),
//     repo.findCourse(courseId),
//     repo.findFinalQuizAttempt(studentId, courseId),
//   ]);

//   if (!student) throw new CertificateIssuanceError("Student not found");
//   if (!course) throw new CertificateIssuanceError("Course not found");

//   const score = finalAttempt?.score ?? 100;
//   const percentage = finalAttempt ? finalAttempt.score : 100;
//   const grade = gradeFromPercentage(percentage);

//   const studentFullName = [student.firstName, student.middleName, student.lastName]
//     .filter(Boolean)
//     .join(" ");

//   const certificateNumber = await generateCertificateNumber(
//     template.courseCode || course.title
//   );

//   // 🔑 No renderCertificatePdf() call here anymore. pdfUrl is left unset —
//   // repo.createCertificate defaults it to null. This is now a fast,
//   // DB-only write, safe to call after every lesson/quiz completion.
//   return repo.createCertificate({
//     certificateNumber,
//     score,
//     percentage,
//     grade,
//     studentNameSnapshot: studentFullName,
//     courseNameSnapshot: course.title,
//     studentId,
//     courseId,
//     templateId: template.id,
//   });
// }

// export async function listCertificatesForStudent(studentId: number) {
//   return repo.listForStudent(studentId);
// }

// /**
//  * Ensures a PDF exists for this certificate, generating it on first call.
//  * This is where the Puppeteer render now actually happens — triggered by
//  * the download route the first time a student clicks Download/Preview.
//  * Subsequent calls just return the already-saved pdfUrl (idempotent).
//  */
// async function ensureCertificatePdf(cert: Awaited<ReturnType<typeof repo.findByIdForStudent>>) {
//   if (!cert) throw new CertificateIssuanceError("Certificate not found");
//   if (cert.pdfUrl) return cert; // already rendered — nothing to do

//   const template = await repo.findTemplateForCourse(cert.courseId);
//   if (!template) {
//     throw new CertificateIssuanceError("Certificate template no longer available");
//   }

//   const { pdfUrl } = await renderCertificatePdf(template, {
//     studentName: cert.studentNameSnapshot,
//     courseName: cert.courseNameSnapshot,
//     certificateNumber: cert.certificateNumber,
//     issueDate: cert.issuedAt.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }),
//     score: cert.score,
//     percentage: cert.percentage,
//     grade: cert.grade,
//   });

//   return repo.updateCertificatePdfUrl(cert.id, pdfUrl);
// }

// export async function getCertificateForDownload(id: string, studentId: number) {
//   const cert = await repo.findByIdForStudent(id, studentId);
//   if (!cert) throw new CertificateIssuanceError("Certificate not found");
//   // 🔑 Lazily render on first download instead of at issuance time.
//   return ensureCertificatePdf(cert);
// }


import { certificateIssuanceRepository as repo } from "./certificateIssuance.repository";
import { generateCertificateNumber } from "./certificateNumber.util";
import { renderCertificatePdf } from "./certificatePdf.service";

export class CertificateIssuanceError extends Error {}

function gradeFromPercentage(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  return "D";
}

export async function isCourseCompletedByStudent(
  studentId: number,
  courseId: string
): Promise<boolean> {
  const modules = await repo.findModulesWithProgress(studentId, courseId);
  const gradableModules = modules.filter((m) => m.type !== "REVISION");
  if (gradableModules.length === 0) return false;

  return gradableModules.every((m) => m.progress.some((p) => p.isCompleted));
}

/**
 * Call this any time a student's progress changes. It's a no-op unless the
 * course is now fully complete and no certificate row exists yet.
 *
 * This only creates the certificate *record* (number, grade, name/course
 * snapshots) — it never renders a PDF. Rendering now happens live, on every
 * download click, in getCertificatePdfForDownload() below.
 */
export async function checkAndIssueCertificate(studentId: number, courseId: string) {
  const existing = await repo.findExistingCertificate(studentId, courseId);
  if (existing) return existing; // already issued — nothing to do

  const completed = await isCourseCompletedByStudent(studentId, courseId);
  if (!completed) return null;

  const template = await repo.findTemplateForCourse(courseId);
  if (!template) {
    console.warn(`Course ${courseId} completed but has no certificate template configured.`);
    return null;
  }

  const [student, course, finalAttempt] = await Promise.all([
    repo.findStudent(studentId),
    repo.findCourse(courseId),
    repo.findFinalQuizAttempt(studentId, courseId),
  ]);

  if (!student) throw new CertificateIssuanceError("Student not found");
  if (!course) throw new CertificateIssuanceError("Course not found");

  const score = finalAttempt?.score ?? 100;
  const percentage = finalAttempt ? finalAttempt.score : 100;
  const grade = gradeFromPercentage(percentage);

  const studentFullName = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");

  const certificateNumber = await generateCertificateNumber(
    template.courseCode || course.title
  );

  return repo.createCertificate({
    certificateNumber,
    score,
    percentage,
    grade,
    studentNameSnapshot: studentFullName,
    courseNameSnapshot: course.title,
    studentId,
    courseId,
    templateId: template.id,
  });
}

export async function listCertificatesForStudent(studentId: number) {
  return repo.listForStudent(studentId);
}

/**
 * Renders the certificate PDF fresh, right now, for this download request.
 * No pdfUrl check, no caching, no disk/blob storage involved — every click
 * re-runs Puppeteer and hands back a brand-new buffer plus the certificate
 * record (used for the filename/number in the response headers).
 */
export async function getCertificatePdfForDownload(id: string, studentId: number) {
  const cert = await repo.findByIdForStudent(id, studentId);
  if (!cert) throw new CertificateIssuanceError("Certificate not found");

  const template = await repo.findTemplateForCourse(cert.courseId);
  if (!template) {
    throw new CertificateIssuanceError("Certificate template no longer available");
  }

  const pdfBuffer = await renderCertificatePdf(template, {
    studentName: cert.studentNameSnapshot,
    courseName: cert.courseNameSnapshot,
    certificateNumber: cert.certificateNumber,
    issueDate: cert.issuedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    score: cert.score,
    percentage: cert.percentage,
    grade: cert.grade,
  });

  return { cert, pdfBuffer };
}
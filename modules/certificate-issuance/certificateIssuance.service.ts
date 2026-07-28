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

// /**
//  * A course counts as "completed" once every active *gradable* module for it
//  * has isCompleted=true in this student's progress. FINAL_QUIZ modules are
//  * covered, since app/api/courses/progress/route.ts marks the quiz's module
//  * complete as soon as a passing attempt is recorded.
//  *
//  * REVISION modules are intentionally excluded from this check: they only
//  * have RevisionContent (no Lessons, no Quiz), and nothing in the progress
//  * flow ever marks that content "complete" — so if REVISION modules were
//  * left in this check, any course containing one could NEVER be marked
//  * complete, and its certificate would never be issued. That was the actual
//  * cause of "other courses' certificates never show up" — it wasn't a
//  * download mix-up, those courses simply never finished issuing in the
//  * first place.
//  */
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
//  * Call this any time a student's progress changes (a lesson is marked
//  * done, a quiz attempt is recorded, etc). It's a no-op unless the course
//  * is now fully complete and no certificate has been issued yet — so it's
//  * safe to call after every progress update without extra guarding.
//  *
//  * On success, the issued PDF has the student's full name
//  * (firstName + middleName + lastName) burned in, per Certificate.
//  */
// export async function checkAndIssueCertificate(studentId: number, courseId: string) {
//   const existing = await repo.findExistingCertificate(studentId, courseId);
//   if (existing) return existing; // already issued — nothing to do

//   const completed = await isCourseCompletedByStudent(studentId, courseId);
//   if (!completed) return null;

//   const template = await repo.findTemplateForCourse(courseId);
//   if (!template) {
//     // No certificate template configured for this course yet — nothing to
//     // issue. Log so admins notice courses missing a template.
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
//   const percentage = finalAttempt ? finalAttempt.score : 100; // adjust if score isn't already a %
//   const grade = gradeFromPercentage(percentage);

//   // Full name = firstName + middleName (if present) + lastName, exactly as
//   // requested — this is what gets rendered onto the certificate PDF.
//   const studentFullName = [student.firstName, student.middleName, student.lastName]
//     .filter(Boolean)
//     .join(" ");

//   const certificateNumber = await generateCertificateNumber(
//     template.courseCode || course.title
//   );

//   const { pdfUrl } = await renderCertificatePdf(template, {
//     studentName: studentFullName,
//     courseName: course.title,
//     certificateNumber,
//     issueDate: new Date().toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }),
//     score,
//     percentage,
//     grade,
//   });

//   return repo.createCertificate({
//     certificateNumber,
//     score,
//     percentage,
//     grade,
//     studentNameSnapshot: studentFullName,
//     courseNameSnapshot: course.title,
//     pdfUrl,
//     studentId,
//     courseId,
//     templateId: template.id,
//   });
// }

// export async function listCertificatesForStudent(studentId: number) {
//   return repo.listForStudent(studentId);
// }

// export async function getCertificateForDownload(id: string, studentId: number) {
//   const cert = await repo.findByIdForStudent(id, studentId);
//   if (!cert) throw new CertificateIssuanceError("Certificate not found");
//   return cert;
// }
// modules/certificate-issuance/certificateIssuance.service.ts

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
 * IMPORTANT: this ONLY creates the certificate *record* (number, grade,
 * name/course snapshots). It deliberately does NOT call renderCertificatePdf
 * — that's the slow Puppeteer step, and we don't want every lesson/quiz
 * completion paying that cost. The PDF is rendered lazily, on first
 * download, by ensureCertificatePdf() below. pdfUrl stays null until then.
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

  // 🔑 No renderCertificatePdf() call here anymore. pdfUrl is left unset —
  // repo.createCertificate defaults it to null. This is now a fast,
  // DB-only write, safe to call after every lesson/quiz completion.
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
 * Ensures a PDF exists for this certificate, generating it on first call.
 * This is where the Puppeteer render now actually happens — triggered by
 * the download route the first time a student clicks Download/Preview.
 * Subsequent calls just return the already-saved pdfUrl (idempotent).
 */
async function ensureCertificatePdf(cert: Awaited<ReturnType<typeof repo.findByIdForStudent>>) {
  if (!cert) throw new CertificateIssuanceError("Certificate not found");
  if (cert.pdfUrl) return cert; // already rendered — nothing to do

  const template = await repo.findTemplateForCourse(cert.courseId);
  if (!template) {
    throw new CertificateIssuanceError("Certificate template no longer available");
  }

  const { pdfUrl } = await renderCertificatePdf(template, {
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

  return repo.updateCertificatePdfUrl(cert.id, pdfUrl);
}

export async function getCertificateForDownload(id: string, studentId: number) {
  const cert = await repo.findByIdForStudent(id, studentId);
  if (!cert) throw new CertificateIssuanceError("Certificate not found");
  // 🔑 Lazily render on first download instead of at issuance time.
  return ensureCertificatePdf(cert);
}
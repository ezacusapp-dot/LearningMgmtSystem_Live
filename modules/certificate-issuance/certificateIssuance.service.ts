

// import { certificateIssuanceRepository as repo } from "./certificateIssuance.repository";
// import { generateCertificateNumber } from "./certificateNumber.util";
// import { renderCertificatePdf, readCachedCertificatePdf } from "./certificatePdf.service";

// export class CertificateIssuanceError extends Error {}

// function gradeFromPercentage(pct: number): string {
//   if (pct >= 90) return "A+";
//   if (pct >= 80) return "A";
//   if (pct >= 70) return "B";
//   if (pct >= 60) return "C";
//   return "D";
// }

// /**
//  * A course is complete when every gradable module has a completed progress
//  * row for this student. REVISION modules are informational only and never
//  * gate completion.
//  */
// export async function isCourseCompletedByStudent(
//   studentId: number,
//   courseId: string
// ): Promise<boolean> {
//   const modules = await repo.findModulesWithProgress(studentId, courseId);
//   const gradableModules = modules.filter((m) => m.type !== "REVISION");

//   if (gradableModules.length === 0) return false;

//   return gradableModules.every((m) => {
//     // No progress rows yet → not complete.
//     if (!m.progress || m.progress.length === 0) return false;
//     return m.progress.some((p) => p.isCompleted);
//   });
// }

// /**
//  * Issues a certificate record if:
//  *   (a) the course is fully complete, and
//  *   (b) no Issued certificate row already exists for (student, course).
//  *
//  * Returns the certificate row on success, or null if the course isn't
//  * complete yet.
//  *
//  * THROWS CertificateIssuanceError if the course IS complete but issuance
//  * is impossible (e.g. no CertificateTemplate configured). Callers must
//  * surface this to the user instead of silently swallowing it.
//  */
// export async function checkAndIssueCertificate(studentId: number, courseId: string) {
//   // 1. Idempotency — only treat an already-Issued cert as "done".
//   const existing = await repo.findExistingCertificate(studentId, courseId);
//   if (existing && existing.status === "Issued") return existing;

//   // 2. Is the course complete?
//   const completed = await isCourseCompletedByStudent(studentId, courseId);
//   if (!completed) return null;

//   // 3. Template must exist. HARD failure, not a silent null.
//   const template = await repo.findTemplateForCourse(courseId);
//   if (!template) {
//     throw new CertificateIssuanceError(
//       `Course ${courseId} is complete but has no CertificateTemplate configured. ` +
//         `Create one before students can receive certificates.`
//     );
//   }

//   const [student, course, finalAttempt] = await Promise.all([
//     repo.findStudent(studentId),
//     repo.findCourse(courseId),
//     repo.findFinalQuizAttempt(studentId, courseId),
//   ]);

//   if (!student) throw new CertificateIssuanceError("Student not found");
//   if (!course) throw new CertificateIssuanceError("Course not found");

//   // 4. Score / percentage.
//   //    If a final quiz attempt exists, its raw score is the numerator and
//   //    the quiz's totalMarks is the denominator. Otherwise default to 100%.
//   let score = 100;
//   let percentage = 100;

//   if (finalAttempt) {
//     const totalMarks =
//       (finalAttempt as any).totalMarks ??
//       (finalAttempt as any).quiz?.totalMarks ??
//       null;

//     score = finalAttempt.score;
//     percentage =
//       totalMarks && totalMarks > 0
//         ? (finalAttempt.score / totalMarks) * 100
//         : finalAttempt.score; // fallback — shouldn't normally happen
//   }

//   const grade = gradeFromPercentage(percentage);

//   const studentFullName = [student.firstName, student.middleName, student.lastName]
//     .filter(Boolean)
//     .join(" ");

//   const certificateNumber = await generateCertificateNumber(
//     template.courseCode || course.title
//   );

//   // 5. Race-safe creation — a concurrent request may have created the row
//   //    between step 1 and here. If the unique constraint fires, return the
//   //    winner instead of crashing.
//   try {
//     return await repo.createCertificate({
//       certificateNumber,
//       score,
//       percentage,
//       grade,
//       studentNameSnapshot: studentFullName,
//       courseNameSnapshot: course.title,
//       studentId,
//       courseId,
//       templateId: template.id,
//     });
//   } catch (err: any) {
//     if (err?.code === "P2002") {
//       const raced = await repo.findExistingCertificate(studentId, courseId);
//       if (raced) return raced;
//     }
//     throw err;
//   }
// }

// export async function listCertificatesForStudent(studentId: number) {
//   return repo.listForStudent(studentId);
// }

// /**
//  * Returns the certificate record plus its PDF as a buffer. Checks the disk
//  * cache first — if this certificate has already been rendered once, we skip
//  * Puppeteer entirely and just read the file. Only a brand-new certificate's
//  * first-ever download actually triggers a render (which then gets cached
//  * for every future click, by anyone, forever).
//  */
// export async function getCertificatePdfForDownload(id: string, studentId: number) {
//   const cert = await repo.findByIdForStudent(id, studentId);
//   if (!cert) throw new CertificateIssuanceError("Certificate not found");

//   const cached = await readCachedCertificatePdf(cert.certificateNumber);
//   if (cached) return { cert, pdfBuffer: cached };

//   const template = await repo.findTemplateForCourse(cert.courseId);
//   if (!template) {
//     throw new CertificateIssuanceError("Certificate template no longer available");
//   }

//   const pdfBuffer = await renderCertificatePdf(template, {
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

//   return { cert, pdfBuffer };
// }

import { certificateIssuanceRepository as repo } from "./certificateIssuance.repository";
import { generateCertificateNumber } from "./certificateNumber.util";
import {
  renderCertificatePdf,
  readCachedCertificatePdf,
  deleteCachedCertificatePdf,
} from "./certificatePdf.service";
import { buildStudentFullName } from "./studentName.util";

export class CertificateIssuanceError extends Error {}

function gradeFromPercentage(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  return "D";
}

/**
 * A course is complete when every gradable module has a completed progress
 * row for this student. REVISION modules never gate completion.
 */
export async function isCourseCompletedByStudent(
  studentId: number,
  courseId: string
): Promise<boolean> {
  const modules = await repo.findModulesWithProgress(studentId, courseId);
  const gradableModules = modules.filter((m) => m.type !== "REVISION");

  if (gradableModules.length === 0) return false;

  return gradableModules.every((m) => {
    if (!m.progress || m.progress.length === 0) return false;
    return m.progress.some((p) => p.isCompleted);
  });
}

/**
 * Issues a certificate record if the course is fully complete and no
 * Issued certificate exists yet for (student, course).
 *
 * Returns the certificate row, or null if the course isn't complete yet.
 * THROWS CertificateIssuanceError if the course IS complete but issuance
 * is impossible (no template, no student name, etc).
 */
export async function checkAndIssueCertificate(studentId: number, courseId: string) {
  // 1. Idempotency
  const existing = await repo.findExistingCertificate(studentId, courseId);
  if (existing && existing.status === "Issued") return existing;

  // 2. Is the course complete?
  const completed = await isCourseCompletedByStudent(studentId, courseId);
  if (!completed) return null;

  // 3. Template must exist
  const template = await repo.findTemplateForCourse(courseId);
  if (!template) {
    throw new CertificateIssuanceError(
      `Course ${courseId} is complete but has no CertificateTemplate configured. ` +
        `Create one before students can receive certificates.`
    );
  }

  const [student, course, finalAttempt] = await Promise.all([
    repo.findStudent(studentId),
    repo.findCourse(courseId),
    repo.findFinalQuizAttempt(studentId, courseId),
  ]);

  if (!student) throw new CertificateIssuanceError("Student not found");
  if (!course) throw new CertificateIssuanceError("Course not found");

  // 4. Score / percentage
  let score = 100;
  let percentage = 100;

  if (finalAttempt) {
    const totalMarks =
      (finalAttempt as any).totalMarks ??
      (finalAttempt as any).quiz?.totalMarks ??
      null;

    score = finalAttempt.score;
    percentage =
      totalMarks && totalMarks > 0
        ? (finalAttempt.score / totalMarks) * 100
        : finalAttempt.score;
  }

  const grade = gradeFromPercentage(percentage);

  // 5. Full name of the student who completed the course
  const studentFullName = buildStudentFullName(student);
  if (!studentFullName) {
    throw new CertificateIssuanceError("Student has no name on record");
  }

  const certificateNumber = await generateCertificateNumber(
    template.courseCode || course.title
  );

  // 6. Race-safe creation
  try {
    return await repo.createCertificate({
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
  } catch (err: any) {
    if (err?.code === "P2002") {
      const raced = await repo.findExistingCertificate(studentId, courseId);
      if (raced) return raced;
    }
    throw err;
  }
}

export async function listCertificatesForStudent(studentId: number) {
  return repo.listForStudent(studentId);
}

/**
 * Returns the certificate record plus its PDF buffer.
 *
 * 1. Re-syncs the name snapshot from the live student record. If it changed,
 *    the snapshot is updated and the stale cached PDF is deleted.
 * 2. Serves the cached PDF if present, otherwise renders (and caches) it.
 */
export async function getCertificatePdfForDownload(id: string, studentId: number) {
  let cert = await repo.findByIdForStudent(id, studentId);
  if (!cert) throw new CertificateIssuanceError("Certificate not found");

  const student = await repo.findStudent(studentId);
  const currentName = student ? buildStudentFullName(student) : "";

  if (currentName && currentName !== cert.studentNameSnapshot) {
    cert = await repo.updateStudentNameSnapshot(cert.id, currentName);
    await deleteCachedCertificatePdf(cert.certificateNumber);
  }

  const cached = await readCachedCertificatePdf(cert.certificateNumber);
  if (cached) return { cert, pdfBuffer: cached };

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
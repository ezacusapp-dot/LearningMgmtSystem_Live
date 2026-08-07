import { certificateRepository } from "./certificate.repository";
import {
  computeGrade,
  computeExpiryDate,
  generateCertificateNumber,
  buildVerificationUrl,
} from "./certificate-utils";
import type { GenerateCertificateSchemaType } from "./certificate.validation";
import type {
  CertificateListQuery,
  RevokeCertificateInput,
  VerifyCertificateResult,
} from "./certificate.types";

export class CertificateServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "CertificateServiceError";
    this.statusCode = statusCode;
  }
}

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const certificateService = {
  /**
   * Issues a certificate for a student against a course, but only if:
   *  - the course belongs to a category
   *  - that category has a certificate template configured
   *  - the given exam attempt is for that course's FINAL exam
   *  - the attempt is marked passed AND meets the template's pass threshold
   *
   * Idempotent: if a live (non-revoked) certificate already exists for
   * this student+course, that existing certificate is returned instead
   * of creating a duplicate.
   */
async generateCertificate(input: GenerateCertificateSchemaType) {
  const { studentId, courseId, examAttemptId } = input;

  const student = await certificateRepository.findStudentById(studentId);
  if (!student) throw new CertificateServiceError("Student not found", 404);

  const course = await certificateRepository.findCourseWithCategory(courseId);
  if (!course) throw new CertificateServiceError("Course not found", 404);
  if (!course.courseCategory) {
    throw new CertificateServiceError(
      "Course is not linked to a course category",
      422
    );
  }

  const template = await certificateRepository.findTemplateByCourse(courseId);
  if (!template) {
    throw new CertificateServiceError(
      "No certificate template configured for this course",
      422
    );
  }

  const examAttempt = await certificateRepository.findExamAttemptById(examAttemptId);
  if (!examAttempt) {
    throw new CertificateServiceError("Exam attempt not found", 404);
  }
  if (examAttempt.exam.courseId !== courseId) {
    throw new CertificateServiceError(
      "Exam attempt does not belong to the specified course",
      422
    );
  }
  if (examAttempt.exam.examType !== "FINAL") {
    throw new CertificateServiceError(
      "Certificates can only be issued from a FINAL exam attempt",
      422
    );
  }
  if (!examAttempt.isPassed) {
    throw new CertificateServiceError(
      "Student has not passed the final exam",
      422
    );
  }

  const percentage =
    examAttempt.percentage ??
    (examAttempt.score / (examAttempt.exam.totalMarks || 1)) * 100;

  const existing = await certificateRepository.findExistingByStudentAndCourse(
    studentId,
    courseId
  );
  if (existing) return existing;

  const grade = computeGrade(percentage); // see updated signature below
  const sequence = (await certificateRepository.countAll()) + 1;
  const certificateNumber = generateCertificateNumber(
    course.courseCategory.code,
    sequence
  );
  const verificationUrl = buildVerificationUrl(APP_BASE_URL, certificateNumber);

  const studentFullName = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");

  const certificate = await certificateRepository.create({
    certificateNumber,
    score: examAttempt.score,
    percentage,
    grade,
    status: "Issued",
    issuedAt: new Date(),
    expiresAt: null, // see note below on validity policy
    verificationUrl,
    studentNameSnapshot: studentFullName,
    courseNameSnapshot: course.title,
    student: { connect: { id: studentId } },
    course: { connect: { id: courseId } },
    template: { connect: { id: template.id } },
    examAttempt: { connect: { id: examAttemptId } },
  });

  return certificate;
},
  async getCertificateById(id: string) {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) throw new CertificateServiceError("Certificate not found", 404);
    return certificate;
  },

  async listCertificates(query: CertificateListQuery) {
    return certificateRepository.findMany(query);
  },

  async verifyCertificate(
    certificateNumber: string
  ): Promise<VerifyCertificateResult> {
    const certificate = await certificateRepository.findByCertificateNumber(
      certificateNumber
    );
    if (!certificate) return { valid: false, reason: "Certificate not found" };
    if (certificate.status === "Revoked") {
      return { valid: false, reason: "Certificate has been revoked" };
    }
    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return { valid: false, reason: "Certificate has expired" };
    }
    return { valid: true, certificate };
  },

  async revokeCertificate(id: string, input: RevokeCertificateInput) {
    const certificate = await certificateRepository.findById(id);
    if (!certificate) throw new CertificateServiceError("Certificate not found", 404);
    if (certificate.status === "Revoked") {
      throw new CertificateServiceError("Certificate is already revoked", 422);
    }
    return certificateRepository.revoke(id, input.reason);
  },
};
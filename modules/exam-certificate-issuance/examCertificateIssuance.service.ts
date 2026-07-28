// modules/exam-certificate-issuance/examCertificateIssuance.service.ts

import { examCertificateIssuanceRepository as repo } from "./examCertificateIssuance.repository";
import { generateExamCertificateNumber } from "./examCertificateNumber.util";
import { achievementCertificateService } from "@/modules/achievement-certificate/achievement.service";
import { AppError } from "@/modules/achievement-certificate/achievement.type";

export const examCertificateIssuanceService = {
  /**
   * Idempotent: if a certificate already exists for this attempt, return it
   * instead of creating a duplicate (attemptId is unique on the table).
   *
   * Throws AppError("NO_GRADE_BAND", 404) if no admin-configured band covers
   * this percentage — the caller decides how to surface that (e.g. exam
   * submission should NOT fail because of this; certificate download should
   * show a friendly "not available yet" message).
   */
  async issueForAttempt(attemptId: string, studentId: number) {
    const existing = await repo.findExistingCertificate(attemptId);
    if (existing) return existing;

    const attempt = await repo.findAttemptForStudent(attemptId, studentId);
    if (!attempt) {
      throw new AppError("Exam attempt not found.", "NOT_FOUND", 404);
    }
    if (attempt.percentage == null) {
      throw new AppError("This attempt has no percentage recorded.", "VALIDATION_ERROR", 422);
    }

    const student = await repo.findStudent(studentId);
    if (!student) {
      throw new AppError("Student not found.", "NOT_FOUND", 404);
    }

    // 🔑 the actual "generate certificate based on percentage" step
    const band = await achievementCertificateService.getBandForPercentage(attempt.percentage);

    const certificateNumber = await generateExamCertificateNumber(attempt.exam.title);
    const studentName = [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ");

    try {
      return await repo.create({
        certificateNumber,
        score: attempt.score,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        certificateName: band.certificateName,
        designation: band.designation,
        colorCode: band.colorCode,
        studentNameSnapshot: studentName,
        examTitleSnapshot: attempt.exam.title,
        studentId,
        examId: attempt.examId,
        attemptId: attempt.id,
        bandId: band.id,
      });
    } catch (err: any) {
      // Race: two requests issuing for the same attempt at once.
      if (err.code === "P2002") {
        const raced = await repo.findExistingCertificate(attemptId);
        if (raced) return raced;
      }
      throw err;
    }
  },

  async getForAttempt(attemptId: string, studentId: number) {
    const attempt = await repo.findAttemptForStudent(attemptId, studentId);
    if (!attempt) {
      throw new AppError("Exam attempt not found.", "NOT_FOUND", 404);
    }
    const cert = await repo.findExistingCertificate(attemptId);
    if (!cert) {
      throw new AppError("Certificate not yet generated for this attempt.", "NOT_FOUND", 404);
    }
    return cert;
  },

  async listForStudent(studentId: number) {
    return repo.listForStudent(studentId);
  },
};
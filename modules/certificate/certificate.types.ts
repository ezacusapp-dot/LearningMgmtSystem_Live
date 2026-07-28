import type {
  Certificate as PrismaCertificate,
  CertificateStatus,
} from "@prisma/client";

export { CertificateStatus };

export type CertificateGrade = "A" | "B" | "C" | "D" | "Fail";

export type Certificate = PrismaCertificate;

export interface GenerateCertificateInput {
  studentId: number;
  courseId: string;
  examAttemptId: string;
}

export interface CertificateResponseDTO {
  id: string;
  certificateNumber: string;
  studentId: number;
  studentName: string;
  courseId: string;
  courseName: string;
  categoryName: string;
  score: number;
  percentage: number;
  grade: CertificateGrade;
  awardCategory: string | null;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt: Date | null;
  verificationUrl: string | null;
  qrCodeUrl: string | null;
  pdfUrl: string | null;
}

export interface RevokeCertificateInput {
  reason: string;
}

export interface CertificateListQuery {
  studentId?: number;
  courseId?: string;
  status?: CertificateStatus;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VerifyCertificateResult {
  valid: boolean;
  certificate?: Certificate;
  reason?: string;
}

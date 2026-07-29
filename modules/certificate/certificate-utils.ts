import type { CertificateGrade } from "./certificate.types";

/**
 * Maps a percentage score to a letter grade using the thresholds
 * configured on the course's CertificateTemplate (gradeA/B/C).
 */
export function computeGrade(percentage: number): CertificateGrade {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 40) return "D";
  return "Fail";
}

/**
 * Parses a validityPeriod string (e.g. "Lifetime", "5 years", "1 year")
 * into an absolute expiry Date. Returns null for "Lifetime" or an
 * unrecognized format (treated as never-expiring).
 */
export function computeExpiryDate(
  validityPeriod: string,
  from: Date = new Date()
): Date | null {
  const normalized = validityPeriod.trim().toLowerCase();
  if (normalized === "lifetime") return null;

  const match = normalized.match(/^(\d+)\s*(year|years|month|months|day|days)$/);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const expiry = new Date(from);

  if (unit.startsWith("year")) expiry.setFullYear(expiry.getFullYear() + amount);
  else if (unit.startsWith("month")) expiry.setMonth(expiry.getMonth() + amount);
  else if (unit.startsWith("day")) expiry.setDate(expiry.getDate() + amount);

  return expiry;
}

/**
 * Generates a human-readable, unique-per-sequence certificate number,
 * e.g. CERT-PYADV-2026-000124
 */
export function generateCertificateNumber(
  categoryCode: string,
  sequence: number
): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(6, "0");
  const safeCode =
    categoryCode.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8) ||
    "CERT";
  return `CERT-${safeCode}-${year}-${paddedSequence}`;
}

export function buildVerificationUrl(
  baseUrl: string,
  certificateNumber: string
): string {
  return `${baseUrl.replace(/\/$/, "")}/verify/${certificateNumber}`;
}

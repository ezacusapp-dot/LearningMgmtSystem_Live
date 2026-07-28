// modules/certificate-issuance/certificateNumber.util.ts
//
// Builds a certificate number like `CERT-PYADV-2026-0007`.
// The sequence is scoped per courseCode+year, derived from a count query.
//
// NOTE: count()+increment isn't atomic, so two students completing the
// same course in the same instant could in theory race for the same
// number. createCertificate() call sites should be prepared to retry once
// on a unique-constraint violation against certificateNumber if that ever
// becomes a real concern at your completion volume.

import { prisma } from "@/lib/prisma";

export async function generateCertificateNumber(courseCode: string): Promise<string> {
  const year = new Date().getFullYear();
  const safeCode = (courseCode || "CERT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);

  const countThisYear = await prisma.certificate.count({
    where: {
      certificateNumber: { startsWith: `CERT-${safeCode}-${year}-` },
    },
  });

  const sequence = String(countThisYear + 1).padStart(4, "0");
  return `CERT-${safeCode}-${year}-${sequence}`;
}
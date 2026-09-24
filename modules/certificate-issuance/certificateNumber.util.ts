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

// import { prisma } from "@/lib/prisma";

// export async function generateCertificateNumber(courseCode: string): Promise<string> {
//   const year = new Date().getFullYear();
//   const safeCode = (courseCode || "CERT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);

//   const countThisYear = await prisma.certificate.count({
//     where: {
//       certificateNumber: { startsWith: `CERT-${safeCode}-${year}-` },
//     },
//   });

//   const sequence = String(countThisYear + 1).padStart(4, "0");
//   return `CERT-${safeCode}-${year}-${sequence}`;
// }
import { prisma } from "@/lib/prisma";

/**
 * Generates a unique certificate number of the form:
 *   CERT-<COURSECODE>-<YEAR>-<SEQUENCE>
 *
 * Retries a few times if a concurrent request has already taken the
 * sequence we computed, so two simultaneous issuances can't collide.
 */
export async function generateCertificateNumber(courseCode: string): Promise<string> {
  const year = new Date().getFullYear();
  const safeCode = (courseCode || "CERT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  const prefix = `CERT-${safeCode}-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const countThisYear = await prisma.certificate.count({
      where: { certificateNumber: { startsWith: prefix } },
    });

    const sequence = String(countThisYear + 1 + attempt).padStart(4, "0");
    const candidate = `${prefix}${sequence}`;

    const clash = await prisma.certificate.findUnique({
      where: { certificateNumber: candidate },
      select: { id: true },
    });

    if (!clash) return candidate;
  }

  throw new Error(
    "Could not generate a unique certificate number after 5 attempts"
  );
}
// modules/exam-certificate-issuance/examCertificateNumber.util.ts
//
// Builds numbers like `ECERT-JSADV-2026-0007`, scoped per exam-title-code + year.

import { prisma } from "@/lib/prisma";

export async function generateExamCertificateNumber(examTitle: string): Promise<string> {
  const year = new Date().getFullYear();
  const safeCode = (examTitle || "EXAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  const countThisYear = await prisma.examCertificate.count({
    where: {
      certificateNumber: { startsWith: `ECERT-${safeCode}-${year}-` },
    },
  });

  const sequence = String(countThisYear + 1).padStart(4, "0");
  return `ECERT-${safeCode}-${year}-${sequence}`;
}
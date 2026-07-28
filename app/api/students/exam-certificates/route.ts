// app/api/students/exam-certificates/route.ts
import { NextRequest } from "next/server";
import { getStudentIdFromSession } from "@/lib/auth";
import { examCertificateIssuanceService } from "@/modules/exam-certificate-issuance/examCertificateIssuance.service";

export async function GET(req: NextRequest) {
  const studentId = await getStudentIdFromSession(req);
  if (!studentId) {
    return Response.json({ status: false, message: "Not authenticated" }, { status: 401 });
  }

  const certs = await examCertificateIssuanceService.listForStudent(studentId);

  const data = certs.map((c) => ({
    id: c.id,
    kind: "exam" as const,
    certificateNumber: c.certificateNumber,
    title: c.examTitleSnapshot,
    issueDate: c.issuedAt.toISOString(),
    grade: c.certificateName,
    percentage: c.percentage,
    colorCode: c.colorCode,
    studentName: c.studentNameSnapshot,
  }));

  return Response.json({ status: true, data });
}
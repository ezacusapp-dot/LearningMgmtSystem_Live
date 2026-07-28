// app/api/students/certificate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getStudentIdFromSession } from "@/lib/auth";
import { listCertificatesForStudent } from "@/modules/certificate-issuance/certificateIssuance.service";

export async function GET(req: NextRequest) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificates = await listCertificatesForStudent(studentId);

    const data = certificates.map((c) => ({
      id: c.id,
      certificateId: c.certificateNumber,
      courseTitle: c.courseNameSnapshot,
      issueDate: c.issuedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      finalGrade: `${c.grade} (${c.percentage}%)`,
      instructor: c.template?.signatory1Name ?? "Course Instructor",
      // Matches the actual folder on disk: app/api/students/certificate/[id]/download
      downloadUrl: `/api/students/certificate/${c.id}/download`,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("List student certificates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
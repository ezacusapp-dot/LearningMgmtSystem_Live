// // app/api/exams/[id]/attempts/[attemptId]/certificate/route.ts
// import { NextRequest } from "next/server";
// import { getStudentIdFromSession } from "@/lib/auth";
// import { examCertificateIssuanceService } from "@/modules/exam-certificate-issuance/examCertificateIssuance.service";
// import { AppError } from "@/modules/achievement-certificate/achievement.type";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string; attemptId: string }> }
// ) {
//   const { attemptId } = await params;
//   const studentId = await getStudentIdFromSession(req);
//   if (!studentId) {
//     return Response.json({ status: false, message: "Not authenticated" }, { status: 401 });
//   }

//   try {
//     // lazy-issue if it wasn't created during submission for some reason
//     const cert = await examCertificateIssuanceService.issueForAttempt(attemptId, studentId);
//     return Response.json({ status: true, data: cert });
//   } catch (err) {
//     if (err instanceof AppError) {
//       return Response.json({ status: false, message: err.message, code: err.code }, { status: err.statusCode });
//     }
//     console.error(err);
//     return Response.json({ status: false, message: "Failed to load certificate" }, { status: 500 });
//   }
// }



// app/api/exams/[id]/attempts/[attemptId]/certificate/route.ts
import { NextRequest } from "next/server";
import { getStudentIdFromSession } from "@/lib/auth";
import { examCertificateIssuanceService } from "@/modules/exam-certificate-issuance/examCertificateIssuance.service";
import { AppError } from "@/modules/achievement-certificate/achievement.type";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const { attemptId } = await params;
  const studentId = await getStudentIdFromSession(req);
  if (!studentId) {
    return Response.json({ status: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    // lazy-issue if it wasn't created during submission for some reason
    const cert = await examCertificateIssuanceService.issueForAttempt(attemptId, studentId);
    return Response.json({ status: true, data: cert });
  } catch (err) {
    if (err instanceof AppError) {
      return Response.json({ status: false, message: err.message, code: err.code }, { status: err.statusCode });
    }
    console.error(err);
    return Response.json({ status: false, message: "Failed to load certificate" }, { status: 500 });
  }
}
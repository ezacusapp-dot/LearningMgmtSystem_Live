// // app/api/exams/[id]/attempts/route.ts
// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id: examId } = await params;
//     const body = await req.json();

//     const {
//       answers,   // { questionId, optionId }[]
//       score,
//       percentage,
//       isPassed,
//       timeTaken,
//       userId,    // optional — pass from JWT if auth middleware decorates req
//     } = body;

//     // Validate exam exists
//     const exam = await prisma.exam.findUnique({
//       where: { id: examId },
//       include: {
//         sections: {
//           include: { questions: { include: { options: true } } },
//         },
//         questions: { include: { options: true } },
//       },
//     });

//     if (!exam) {
//       return Response.json({ status: false, message: "Exam not found" }, { status: 404 });
//     }

//     // Check max attempts
//     if (userId) {
//       const existingAttempts = await prisma.examAttempt.count({
//         where: { examId, userId },
//       });
//       if (existingAttempts >= exam.maxAttempts) {
//         return Response.json(
//           { status: false, message: `Maximum ${exam.maxAttempts} attempt(s) allowed` },
//           { status: 400 }
//         );
//       }
//     }

//     // Server-side score calculation (authoritative)
//     const allQuestions =
//       exam.sections.length > 0
//         ? exam.sections.flatMap((s) => s.questions)
//         : exam.questions;

//     let serverScore = 0;
//     const answerMap: Record<string, string> = {};
//     if (Array.isArray(answers)) {
//       answers.forEach((a: { questionId: string; optionId: string }) => {
//         answerMap[a.questionId] = a.optionId;
//       });
//     }

//     const answerResults: {
//       questionId: string;
//       optionId: string;
//       isCorrect: boolean;
//     }[] = [];

//     allQuestions.forEach((q) => {
//       const selectedId = answerMap[q.id];
//       if (!selectedId) return;
//       const correctOpt = q.options.find((o) => o.isCorrect);
//       const isCorrect = correctOpt?.id === selectedId;
//       if (isCorrect) serverScore += q.points;
//       answerResults.push({ questionId: q.id, optionId: selectedId, isCorrect });
//     });

//     const serverPercentage =
//       exam.totalMarks > 0 ? (serverScore / exam.totalMarks) * 100 : 0;
//     const serverIsPassed = serverScore >= exam.passingMarks;

//     // Persist attempt
//     const attempt = await prisma.examAttempt.create({
//       data: {
//         examId,
//         userId: userId ?? null,
//         score: serverScore,
//         percentage: serverPercentage,
//         isPassed: serverIsPassed,
//         timeTaken: timeTaken ?? null,
//         startedAt: null,
//         completedAt: new Date(),
//         answers: {
//           create: answerResults.map((ar) => ({
//             questionId: ar.questionId,
//             optionId: ar.optionId,
//             isCorrect: ar.isCorrect,
//           })),
//         },
//       },
//     });

//     // Section scores
//     const sectionScores: any[] = [];
//     if (exam.sections.length > 0) {
//       for (const section of exam.sections) {
//         let sScore = 0;
//         let correctlyAnswered = 0;
//         section.questions.forEach((q) => {
//           const sel = answerMap[q.id];
//           if (!sel) return;
//           const correct = q.options.find((o) => o.isCorrect);
//           if (correct?.id === sel) {
//             sScore += q.points;
//             correctlyAnswered++;
//           }
//         });
//         const sTotal = section.questions.reduce((s, q) => s + q.points, 0);
//         const sectionScore = await prisma.examSectionScore.create({
//           data: {
//             attemptId: attempt.id,
//             sectionId: section.id,
//             score: sScore,
//             percentage: sTotal > 0 ? (sScore / sTotal) * 100 : 0,
//             isPassed: section.passingMarks ? sScore >= section.passingMarks : null,
//             totalQuestions: section.questions.length,
//             correctlyAnswered,
//           },
//         });
//         sectionScores.push({
//           ...sectionScore,
//           sectionTitle: section.title,
//         });
//       }
//     }

//     return Response.json({
//       status: true,
//       message: serverIsPassed ? "Congratulations! You passed!" : "Exam submitted.",
//       data: {
//         id: attempt.id,
//         score: serverScore,
//         percentage: serverPercentage,
//         isPassed: serverIsPassed,
//         sectionScores,
//       },
//     });
//   } catch (err: any) {
//     console.error("POST /api/exams/[id]/attempts error:", err);
//     return Response.json({ status: false, message: err.message }, { status: 500 });
//   }
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id: examId } = await params;
//     const { searchParams } = req.nextUrl;
//     const userId = searchParams.get("userId");

//     const where: any = { examId };
//     if (userId) where.userId = userId;

//     const attempts = await prisma.examAttempt.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       include: { sectionScores: true },
//     });

//     return Response.json({ status: true, data: attempts });
//   } catch (err: any) {
//     return Response.json({ status: false, message: err.message }, { status: 500 });
//   }
// }



// app/api/exams/[id]/attempts/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentIdFromSession } from "@/lib/auth";
import { examCertificateIssuanceService } from "@/modules/exam-certificate-issuance/examCertificateIssuance.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const body = await req.json();
    const { answers, timeTaken } = body;

    // 🔑 trust the session, not a client-supplied userId
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return Response.json({ status: false, message: "Not authenticated" }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: { include: { questions: { include: { options: true } } } },
        questions: { include: { options: true } },
      },
    });
    if (!exam) {
      return Response.json({ status: false, message: "Exam not found" }, { status: 404 });
    }

    const existingAttempts = await prisma.examAttempt.count({
      where: { examId, studentId },
    });
    if (existingAttempts >= exam.maxAttempts) {
      return Response.json(
        { status: false, message: `Maximum ${exam.maxAttempts} attempt(s) allowed` },
        { status: 400 }
      );
    }

    const allQuestions =
      exam.sections.length > 0 ? exam.sections.flatMap((s) => s.questions) : exam.questions;

    let serverScore = 0;
    const answerMap: Record<string, string> = {};
    if (Array.isArray(answers)) {
      answers.forEach((a: { questionId: string; optionId: string }) => {
        answerMap[a.questionId] = a.optionId;
      });
    }

    const answerResults: { questionId: string; optionId: string; isCorrect: boolean }[] = [];
    allQuestions.forEach((q) => {
      const selectedId = answerMap[q.id];
      if (!selectedId) return;
      const correctOpt = q.options.find((o) => o.isCorrect);
      const isCorrect = correctOpt?.id === selectedId;
      if (isCorrect) serverScore += q.points;
      answerResults.push({ questionId: q.id, optionId: selectedId, isCorrect });
    });

    const serverPercentage = exam.totalMarks > 0 ? (serverScore / exam.totalMarks) * 100 : 0;
    const serverIsPassed = serverScore >= exam.passingMarks;

    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId,
        score: serverScore,
        percentage: serverPercentage,
        isPassed: serverIsPassed,
        timeTaken: timeTaken ?? null,
        startedAt: null,
        completedAt: new Date(),
        answers: {
          create: answerResults.map((ar) => ({
            questionId: ar.questionId,
            optionId: ar.optionId,
            isCorrect: ar.isCorrect,
          })),
        },
      },
    });

    const sectionScores: any[] = [];
    if (exam.sections.length > 0) {
      for (const section of exam.sections) {
        let sScore = 0;
        let correctlyAnswered = 0;
        section.questions.forEach((q) => {
          const sel = answerMap[q.id];
          if (!sel) return;
          const correct = q.options.find((o) => o.isCorrect);
          if (correct?.id === sel) {
            sScore += q.points;
            correctlyAnswered++;
          }
        });
        const sTotal = section.questions.reduce((s, q) => s + q.points, 0);
        const sectionScore = await prisma.examSectionScore.create({
          data: {
            attemptId: attempt.id,
            sectionId: section.id,
            score: sScore,
            percentage: sTotal > 0 ? (sScore / sTotal) * 100 : 0,
            isPassed: null,
            totalQuestions: section.questions.length,
            correctlyAnswered,
          },
        });
        sectionScores.push({ ...sectionScore, sectionTitle: section.title });
      }
    }

    // 🔑 generate the certificate based on percentage — best-effort.
    // A missing grade band (admin hasn't configured 0–100 coverage) must
    // NOT block the student from seeing their result.
    let certificate = null;
    try {
      certificate = await examCertificateIssuanceService.issueForAttempt(attempt.id, studentId);
    } catch (certErr) {
      console.warn("Certificate not issued for attempt", attempt.id, certErr);
    }

    return Response.json({
      status: true,
      message: serverIsPassed ? "Congratulations! You passed!" : "Exam submitted.",
      data: {
        id: attempt.id,
        score: serverScore,
        percentage: serverPercentage,
        isPassed: serverIsPassed,
        sectionScores,
        certificate, // null if no band matched — frontend handles that
      },
    });
  } catch (err: any) {
    console.error("POST /api/exams/[id]/attempts error:", err);
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params;
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return Response.json({ status: false, message: "Not authenticated" }, { status: 401 });
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { examId, studentId },
      orderBy: { createdAt: "desc" },
      include: { sectionScores: true, examCertificate: true },
    });

    return Response.json({ status: true, data: attempts });
  } catch (err: any) {
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
}
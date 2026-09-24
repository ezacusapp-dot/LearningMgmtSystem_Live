
// // app/api/courses/progress/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getStudentIdFromSession } from "@/lib/auth";
// import { checkAndIssueCertificate } from "@/modules/certificate-issuance/certificateIssuance.service";

// const fail = (message: string, status = 400) =>
//   NextResponse.json({ status: false, message }, { status });

// // ─────────────────────────────────────────────────────────────────────
// // POST — start / complete_lesson / submit_quiz
// // ─────────────────────────────────────────────────────────────────────
// export async function POST(req: NextRequest) {
//   try {
//     const studentId = await getStudentIdFromSession(req);
//     if (!studentId) return fail("Unauthorized", 401);

//     const body = await req.json();
//     const { courseId, lessonId, quizId, action, answers } = body;
//     if (!courseId) return fail("Course ID required");

//     // ── Get or create enrollment ─────────────────────────────────────
//     let enrollment = await prisma.studentCourseEnrollment.findUnique({
//       where: { studentId_courseId: { studentId, courseId } },
//     });

//     if (
//       !enrollment &&
//       (action === "start" || action === "complete_lesson" || action === "submit_quiz")
//     ) {
//       enrollment = await prisma.studentCourseEnrollment.create({
//         data: { studentId, courseId, enrolledAt: new Date() },
//       });
//     }

//     // ── Start course ─────────────────────────────────────────────────
//     if (action === "start") {
//       if (enrollment && !enrollment.startDate) {
//         await prisma.studentCourseEnrollment.update({
//           where: { id: enrollment.id },
//           data: { startDate: new Date() },
//         });
//       }
//       return NextResponse.json({ status: true, message: "Course started" });
//     }

//     // ── Complete a lesson ────────────────────────────────────────────
//     if (action === "complete_lesson" && lessonId) {
//       if (!enrollment) return fail("Enrollment not found");

//       const lesson = await prisma.lessons.findUnique({ where: { id: lessonId } });
//       if (!lesson) return fail("Lesson not found", 404);

//       const existingProgress = await prisma.studentLessonProgress.findUnique({
//         where: { studentId_lessonId: { studentId, lessonId } },
//       });
//       if (existingProgress?.isCompleted) return fail("Lesson already completed");

//       await prisma.studentLessonProgress.upsert({
//         where: { studentId_lessonId: { studentId, lessonId } },
//         update: { isCompleted: true, completedAt: new Date(), enrollmentId: enrollment.id },
//         create: {
//           studentId,
//           lessonId,
//           enrollmentId: enrollment.id,
//           isCompleted: true,
//           completedAt: new Date(),
//         },
//       });

//       // Roll up into module completion
//       const moduleLessons = await prisma.lessons.findMany({
//         where: { moduleId: lesson.moduleId, isActive: true },
//         select: { id: true },
//       });
//       const completedInModule = await prisma.studentLessonProgress.count({
//         where: {
//           studentId,
//           isCompleted: true,
//           lessonId: { in: moduleLessons.map((l) => l.id) },
//         },
//       });
//       if (moduleLessons.length > 0 && completedInModule >= moduleLessons.length) {
//         await prisma.studentModuleProgress.upsert({
//           where: { studentId_moduleId: { studentId, moduleId: lesson.moduleId } },
//           update: { isCompleted: true, completedAt: new Date() },
//           create: {
//             studentId,
//             moduleId: lesson.moduleId,
//             isCompleted: true,
//             completedAt: new Date(),
//           },
//         });
//       }

//       // Counters for progress %
//       const course = await prisma.courses.findUnique({
//         where: { id: courseId },
//         include: { modules: { where: { isActive: true }, include: { lessons: true } } },
//       });
//       const totalLessons =
//         course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
//       const completedLessons = await prisma.studentLessonProgress.count({
//         where: {
//           studentId,
//           isCompleted: true,
//           lesson: { moduleId: { in: (course?.modules ?? []).map((m) => m.id) } },
//         },
//       });

//       // Certificate = single source of truth for completion
//       let certificate = null;
//       let certificateError: string | null = null;
//       try {
//         certificate = await checkAndIssueCertificate(studentId, courseId);
//       } catch (err: any) {
//         certificateError = err?.message || "Certificate could not be issued";
//         console.error("Certificate issuance failed (complete_lesson):", err);
//       }

//       // ✅ Set endDate whenever a certificate exists
//       if (certificate && !enrollment.endDate) {
//         await prisma.studentCourseEnrollment.update({
//           where: { id: enrollment.id },
//           data: { endDate: new Date() },
//         });
//       }

//       return NextResponse.json({
//         status: true,
//         message: "Lesson completed",
//         progress: {
//           completed: completedLessons,
//           total: totalLessons,
//           courseCompleted: !!certificate,
//           percentage:
//             totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
//         },
//         certificateIssued: !!certificate,
//         certificateId: certificate?.id ?? null,
//         certificateNumber: certificate?.certificateNumber ?? null,
//         certificateError,
//       });
//     }

//     // ── Submit a quiz ────────────────────────────────────────────────
//     if (action === "submit_quiz" && quizId) {
//       if (!enrollment) return fail("Enrollment not found");

//       const quizInclude = {
//         questions: { include: { options: true } },
//       } as const;

//       // Accept either Quiz.id or Modules.id
//       const quiz =
//         (await prisma.quiz.findUnique({ where: { id: quizId }, include: quizInclude })) ??
//         (await prisma.quiz.findFirst({
//           where: { moduleId: quizId },
//           include: quizInclude,
//         }));

//       if (!quiz) {
//         console.error("submit_quiz: no quiz found for id", quizId);
//         return fail("Quiz not found", 404);
//       }

//       const realQuizId = quiz.id;

//       const existingAttempt = await prisma.studentQuizAttempt.findUnique({
//         where: { studentId_quizId: { studentId, quizId: realQuizId } },
//       });
//       if (existingAttempt) {
//         return fail("Quiz already attempted. Only one attempt allowed.");
//       }

//       const given: Record<string, string> =
//         answers && typeof answers === "object" ? answers : {};

//       let score = 0;
//       const answerRows: { questionId: string; optionId: string; isCorrect: boolean }[] =
//         [];

//       for (const q of quiz.questions) {
//         const chosenId = given[q.id];
//         if (!chosenId) continue;
//         const chosen = q.options.find((o) => o.id === chosenId);
//         if (!chosen) continue;
//         const isCorrect = !!chosen.isCorrect;
//         if (isCorrect) score += q.points ?? 1;
//         answerRows.push({ questionId: q.id, optionId: chosen.id, isCorrect });
//       }

//       const isPassed = score >= quiz.passingMarks;

//       const attempt = await prisma.studentQuizAttempt.create({
//         data: {
//           studentId,
//           quizId: realQuizId,
//           enrollmentId: enrollment.id,
//           score,
//           isPassed,
//         },
//       });

//       if (answerRows.length > 0) {
//         await prisma.studentQuizAnswer.createMany({
//           data: answerRows.map((r) => ({ attemptId: attempt.id, ...r })),
//         });
//       }

//       // Any submitted attempt completes the quiz module
//       await prisma.studentModuleProgress.upsert({
//         where: { studentId_moduleId: { studentId, moduleId: quiz.moduleId } },
//         update: { isCompleted: true, completedAt: new Date() },
//         create: {
//           studentId,
//           moduleId: quiz.moduleId,
//           isCompleted: true,
//           completedAt: new Date(),
//         },
//       });

//       let certificate = null;
//       let certificateError: string | null = null;
//       try {
//         certificate = await checkAndIssueCertificate(studentId, courseId);
//       } catch (err: any) {
//         certificateError = err?.message || "Certificate could not be issued";
//         console.error("Certificate issuance failed (submit_quiz):", err);
//       }

//       // ✅ Set endDate whenever a certificate exists
//       if (certificate && !enrollment.endDate) {
//         await prisma.studentCourseEnrollment.update({
//           where: { id: enrollment.id },
//           data: { endDate: new Date() },
//         });
//       }

//       return NextResponse.json({
//         status: true,
//         message: isPassed
//           ? "Quiz passed! Great job! 🎉"
//           : "Quiz submitted. Check the answers below.",
//         attemptId: attempt.id,
//         quizId: realQuizId,
//         moduleId: quiz.moduleId,
//         score,
//         isPassed,
//         totalMarks: quiz.totalMarks,
//         answers: given, // ✅ echo back so the client can build the review
//         courseCompleted: !!certificate,
//         certificateIssued: !!certificate,
//         certificateId: certificate?.id ?? null,
//         certificateNumber: certificate?.certificateNumber ?? null,
//         certificateError,
//       });
//     }

//     return fail("Invalid action");
//   } catch (error: any) {
//     console.error("Progress API error:", error);
//     return NextResponse.json({ status: false, message: error.message }, { status: 500 });
//   }
// }

// // ─────────────────────────────────────────────────────────────────────
// // GET — load progress for a course
// // ─────────────────────────────────────────────────────────────────────
// export async function GET(req: NextRequest) {
//   try {
//     const studentId = await getStudentIdFromSession(req);
//     if (!studentId) return fail("Unauthorized", 401);

//     const courseId = new URL(req.url).searchParams.get("courseId");
//     if (!courseId) return fail("Course ID required");

//     const enrollment = await prisma.studentCourseEnrollment.findUnique({
//       where: { studentId_courseId: { studentId, courseId } },
//     });

//     const course = await prisma.courses.findUnique({
//       where: { id: courseId },
//       include: { modules: { where: { isActive: true }, select: { id: true } } },
//     });
//     const moduleIds = (course?.modules ?? []).map((m) => m.id);

//     const completedLessons = await prisma.studentLessonProgress.findMany({
//       where: { studentId, isCompleted: true, lesson: { moduleId: { in: moduleIds } } },
//       select: { lessonId: true },
//     });

//     const quizzes = await prisma.quiz.findMany({
//       where: { moduleId: { in: moduleIds } },
//       select: { id: true, moduleId: true },
//     });
//     const moduleByQuiz = new Map(quizzes.map((q) => [q.id, q.moduleId]));

//     const attempts = await prisma.studentQuizAttempt.findMany({
//       where: { studentId, quizId: { in: quizzes.map((q) => q.id) } },
//       select: {
//         quizId: true,
//         score: true,
//         isPassed: true,
//         createdAt: true,
//         // ✅ pull stored answers so the review page can rebuild them
//         answers: { select: { questionId: true, optionId: true, isCorrect: true } },
//       },
//     });

//     const quizAttempts = attempts.map((a) => {
//       const answerMap: Record<string, string> = {};
//       for (const ans of a.answers ?? []) {
//         answerMap[ans.questionId] = ans.optionId;
//       }
//       return {
//         quizId: a.quizId,
//         moduleId: moduleByQuiz.get(a.quizId) ?? null,
//         score: a.score,
//         isPassed: a.isPassed,
//         createdAt: a.createdAt,
//         answers: answerMap,
//       };
//     });

//     const certificate = await prisma.certificate.findUnique({
//       where: { studentId_courseId: { studentId, courseId } },
//     });

//     // Derive status: certificate presence OR endDate means Complete
//     const status = !enrollment
//       ? null
//       : enrollment.endDate || certificate
//       ? "Complete"
//       : enrollment.startDate
//       ? "InProcess"
//       : "Pending";

//     return NextResponse.json({
//       status: true,
//       data: {
//         enrollment: enrollment
//           ? {
//               status,
//               startDate: enrollment.startDate,
//               endDate: enrollment.endDate,
//               enrolledAt: enrollment.enrolledAt,
//             }
//           : null,
//         completedLessonIds: completedLessons.map((l) => l.lessonId),
//         quizAttempts,
//         certificate: certificate
//           ? {
//               id: certificate.id,
//               certificateNumber: certificate.certificateNumber,
//               downloadUrl: `/api/students/certificate/${certificate.id}/download`,
//             }
//           : null,
//       },
//     });
//   } catch (error: any) {
//     console.error("Progress GET error:", error);
//     return NextResponse.json({ status: false, message: error.message }, { status: 500 });
//   }
// }
// app/api/courses/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentIdFromSession } from "@/lib/auth";
import { checkAndIssueCertificate } from "@/modules/certificate-issuance/certificateIssuance.service";

const fail = (message: string, status = 400) =>
  NextResponse.json({ status: false, message }, { status });

// ─────────────────────────────────────────────────────────────────────
// Helper: is the course actually 100% complete for this student?
// Counts BOTH lesson-type modules AND quiz-type modules.
// ─────────────────────────────────────────────────────────────────────
async function isCourseFullyComplete(
  studentId: number,
  courseId: string
): Promise<{ complete: boolean; debug: any }> {
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        where: { isActive: true },
        include: {
          lessons: { where: { isActive: true }, select: { id: true } },
          quiz: { select: { id: true } },
          revision: {
            include: { contents: { select: { id: true } } },
          },
        },
      },
    },
  });

  if (!course) return { complete: false, debug: { reason: "course not found" } };

  const lessonModuleIds: string[] = [];
  const allLessonIds: string[] = [];
  const quizModuleIds: string[] = [];
  const allQuizIds: string[] = [];

  for (const m of course.modules) {
    if (m.type === "LESSON") {
      lessonModuleIds.push(m.id);
      allLessonIds.push(...m.lessons.map((l) => l.id));
    } else if (m.type === "QUIZ" || m.type === "FINAL_QUIZ") {
      if (m.quiz) {
        quizModuleIds.push(m.id);
        allQuizIds.push(m.quiz.id);
      }
    }
    // REVISION: intentionally not counted as a gradable gate
  }

  const completedLessons = await prisma.studentLessonProgress.count({
    where: {
      studentId,
      isCompleted: true,
      lessonId: { in: allLessonIds },
    },
  });

  const quizAttempts = await prisma.studentQuizAttempt.count({
    where: {
      studentId,
      quizId: { in: allQuizIds },
    },
  });

  const lessonsOk = allLessonIds.length === 0 || completedLessons >= allLessonIds.length;
  const quizzesOk = allQuizIds.length === 0 || quizAttempts >= allQuizIds.length;
  const complete = lessonsOk && quizzesOk;

  return {
    complete,
    debug: {
      totalLessons: allLessonIds.length,
      completedLessons,
      totalQuizzes: allQuizIds.length,
      quizAttempts,
      lessonsOk,
      quizzesOk,
      lessonModuleIds,
      quizModuleIds,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Helper: try to issue a certificate, with detailed logging
// ─────────────────────────────────────────────────────────────────────
async function tryIssueCertificate(
  studentId: number,
  courseId: string
): Promise<{ certificate: any; error: string | null }> {
  let certificate: any = null;
  let error: string | null = null;

  try {
    certificate = await checkAndIssueCertificate(studentId, courseId);
    console.log(
      `[cert] checkAndIssueCertificate(${studentId}, ${courseId}) →`,
      certificate ? `issued id=${certificate.id}` : "null"
    );
  } catch (err: any) {
    error = err?.message || "Certificate could not be issued";
    console.error("[cert] issuance threw:", err);
  }

  // If the service didn't return a certificate, check whether one already
  // exists in the DB (idempotent case) before giving up.
  if (!certificate) {
    const existing = await prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) {
      console.log(`[cert] existing certificate found id=${existing.id}`);
      certificate = existing;
    }
  }

  return { certificate, error };
}

// ─────────────────────────────────────────────────────────────────────
// POST — start / complete_lesson / submit_quiz
// ─────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) return fail("Unauthorized", 401);

    const body = await req.json();
    const { courseId, lessonId, quizId, action, answers } = body;
    if (!courseId) return fail("Course ID required");

    let enrollment = await prisma.studentCourseEnrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (
      !enrollment &&
      (action === "start" || action === "complete_lesson" || action === "submit_quiz")
    ) {
      enrollment = await prisma.studentCourseEnrollment.create({
        data: { studentId, courseId, enrolledAt: new Date() },
      });
    }

    // ── Start course ─────────────────────────────────────────────────
    if (action === "start") {
      if (enrollment && !enrollment.startDate) {
        await prisma.studentCourseEnrollment.update({
          where: { id: enrollment.id },
          data: { startDate: new Date() },
        });
      }
      return NextResponse.json({ status: true, message: "Course started" });
    }

    // ── Complete a lesson ────────────────────────────────────────────
    if (action === "complete_lesson" && lessonId) {
      if (!enrollment) return fail("Enrollment not found");

      const lesson = await prisma.lessons.findUnique({ where: { id: lessonId } });
      if (!lesson) return fail("Lesson not found", 404);

      const existingProgress = await prisma.studentLessonProgress.findUnique({
        where: { studentId_lessonId: { studentId, lessonId } },
      });
      if (existingProgress?.isCompleted) return fail("Lesson already completed");

      await prisma.studentLessonProgress.upsert({
        where: { studentId_lessonId: { studentId, lessonId } },
        update: { isCompleted: true, completedAt: new Date(), enrollmentId: enrollment.id },
        create: {
          studentId,
          lessonId,
          enrollmentId: enrollment.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Roll up into module completion (only meaningful for LESSON modules)
      const moduleLessons = await prisma.lessons.findMany({
        where: { moduleId: lesson.moduleId, isActive: true },
        select: { id: true },
      });
      const completedInModule = await prisma.studentLessonProgress.count({
        where: {
          studentId,
          isCompleted: true,
          lessonId: { in: moduleLessons.map((l) => l.id) },
        },
      });
      if (moduleLessons.length > 0 && completedInModule >= moduleLessons.length) {
        await prisma.studentModuleProgress.upsert({
          where: { studentId_moduleId: { studentId, moduleId: lesson.moduleId } },
          update: { isCompleted: true, completedAt: new Date() },
          create: {
            studentId,
            moduleId: lesson.moduleId,
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      }

      // ── Self-healing certificate check ─────────────────────────────
      const { complete, debug } = await isCourseFullyComplete(studentId, courseId);
      console.log("[complete_lesson] completion check:", debug);

      let certificate = null;
      let certificateError: string | null = null;

      if (complete) {
        const result = await tryIssueCertificate(studentId, courseId);
        certificate = result.certificate;
        certificateError = result.error;
      } else {
        // Still try — the service might have its own logic
        const result = await tryIssueCertificate(studentId, courseId);
        certificate = result.certificate;
        certificateError = result.error;
      }

      if (certificate && !enrollment.endDate) {
        await prisma.studentCourseEnrollment.update({
          where: { id: enrollment.id },
          data: { endDate: new Date() },
        });
      }

      // Progress counters (for the UI)
      const course = await prisma.courses.findUnique({
        where: { id: courseId },
        include: { modules: { where: { isActive: true }, include: { lessons: true } } },
      });
      const totalLessons =
        course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
      const completedLessons = await prisma.studentLessonProgress.count({
        where: {
          studentId,
          isCompleted: true,
          lesson: { moduleId: { in: (course?.modules ?? []).map((m) => m.id) } },
        },
      });

      return NextResponse.json({
        status: true,
        message: "Lesson completed",
        progress: {
          completed: completedLessons,
          total: totalLessons,
          courseCompleted: !!certificate,
          percentage:
            totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        },
        certificateIssued: !!certificate,
        certificateId: certificate?.id ?? null,
        certificateNumber: certificate?.certificateNumber ?? null,
        certificateError,
      });
    }

    // ── Submit a quiz ────────────────────────────────────────────────
    if (action === "submit_quiz" && quizId) {
      if (!enrollment) return fail("Enrollment not found");

      const quizInclude = {
        questions: { include: { options: true } },
      } as const;

      const quiz =
        (await prisma.quiz.findUnique({ where: { id: quizId }, include: quizInclude })) ??
        (await prisma.quiz.findFirst({
          where: { moduleId: quizId },
          include: quizInclude,
        }));

      if (!quiz) {
        console.error("submit_quiz: no quiz found for id", quizId);
        return fail("Quiz not found", 404);
      }

      const realQuizId = quiz.id;

      const existingAttempt = await prisma.studentQuizAttempt.findUnique({
        where: { studentId_quizId: { studentId, quizId: realQuizId } },
      });
      if (existingAttempt) {
        return fail("Quiz already attempted. Only one attempt allowed.");
      }

      const given: Record<string, string> =
        answers && typeof answers === "object" ? answers : {};

      let score = 0;
      const answerRows: { questionId: string; optionId: string; isCorrect: boolean }[] =
        [];

      for (const q of quiz.questions) {
        const chosenId = given[q.id];
        if (!chosenId) continue;
        const chosen = q.options.find((o) => o.id === chosenId);
        if (!chosen) continue;
        const isCorrect = !!chosen.isCorrect;
        if (isCorrect) score += q.points ?? 1;
        answerRows.push({ questionId: q.id, optionId: chosen.id, isCorrect });
      }

      const isPassed = score >= quiz.passingMarks;

      const attempt = await prisma.studentQuizAttempt.create({
        data: {
          studentId,
          quizId: realQuizId,
          enrollmentId: enrollment.id,
          score,
          isPassed,
        },
      });

      if (answerRows.length > 0) {
        await prisma.studentQuizAnswer.createMany({
          data: answerRows.map((r) => ({ attemptId: attempt.id, ...r })),
        });
      }

      // Mark the quiz's module complete
      await prisma.studentModuleProgress.upsert({
        where: { studentId_moduleId: { studentId, moduleId: quiz.moduleId } },
        update: { isCompleted: true, completedAt: new Date() },
        create: {
          studentId,
          moduleId: quiz.moduleId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // ── Self-healing certificate check ─────────────────────────────
      const { complete, debug } = await isCourseFullyComplete(studentId, courseId);
      console.log("[submit_quiz] completion check:", debug);

      let certificate = null;
      let certificateError: string | null = null;

      if (complete) {
        const result = await tryIssueCertificate(studentId, courseId);
        certificate = result.certificate;
        certificateError = result.error;
      } else {
        const result = await tryIssueCertificate(studentId, courseId);
        certificate = result.certificate;
        certificateError = result.error;
      }

      if (certificate && !enrollment.endDate) {
        await prisma.studentCourseEnrollment.update({
          where: { id: enrollment.id },
          data: { endDate: new Date() },
        });
      }

      return NextResponse.json({
        status: true,
        message: isPassed
          ? "Quiz passed! Great job! 🎉"
          : "Quiz submitted. Check the answers below.",
        attemptId: attempt.id,
        quizId: realQuizId,
        moduleId: quiz.moduleId,
        score,
        isPassed,
        totalMarks: quiz.totalMarks,
        answers: given,
        courseCompleted: !!certificate,
        certificateIssued: !!certificate,
        certificateId: certificate?.id ?? null,
        certificateNumber: certificate?.certificateNumber ?? null,
        certificateError,
      });
    }

    return fail("Invalid action");
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────
// GET — load progress for a course
// ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) return fail("Unauthorized", 401);

    const courseId = new URL(req.url).searchParams.get("courseId");
    if (!courseId) return fail("Course ID required");

    const enrollment = await prisma.studentCourseEnrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: { modules: { where: { isActive: true }, select: { id: true } } },
    });
    const moduleIds = (course?.modules ?? []).map((m) => m.id);

    const completedLessons = await prisma.studentLessonProgress.findMany({
      where: { studentId, isCompleted: true, lesson: { moduleId: { in: moduleIds } } },
      select: { lessonId: true },
    });

    const quizzes = await prisma.quiz.findMany({
      where: { moduleId: { in: moduleIds } },
      select: { id: true, moduleId: true },
    });
    const moduleByQuiz = new Map(quizzes.map((q) => [q.id, q.moduleId]));

    const attempts = await prisma.studentQuizAttempt.findMany({
      where: { studentId, quizId: { in: quizzes.map((q) => q.id) } },
      select: {
        quizId: true,
        score: true,
        isPassed: true,
        createdAt: true,
        answers: { select: { questionId: true, optionId: true, isCorrect: true } },
      },
    });

    const quizAttempts = attempts.map((a) => {
      const answerMap: Record<string, string> = {};
      for (const ans of a.answers ?? []) {
        answerMap[ans.questionId] = ans.optionId;
      }
      return {
        quizId: a.quizId,
        moduleId: moduleByQuiz.get(a.quizId) ?? null,
        score: a.score,
        isPassed: a.isPassed,
        createdAt: a.createdAt,
        answers: answerMap,
      };
    });

    // ── Certificate: look up AND self-heal if course is complete ───
    let certificate = await prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (!certificate) {
      const { complete, debug } = await isCourseFullyComplete(studentId, courseId);
      console.log("[GET] completion check:", debug);
      if (complete) {
        try {
          const issued = await checkAndIssueCertificate(studentId, courseId);
          if (issued) {
            certificate = issued;
            console.log(`[GET] self-healed certificate id=${issued.id}`);
          }
        } catch (err) {
          console.error("[GET] certificate self-heal failed:", err);
        }
      }
    }

    // Derive status
    const status = !enrollment
      ? null
      : enrollment.endDate || certificate
      ? "Complete"
      : enrollment.startDate
      ? "InProcess"
      : "Pending";

    // If course is complete but enrollment.endDate wasn't set, fix it now
    if (certificate && enrollment && !enrollment.endDate) {
      await prisma.studentCourseEnrollment.update({
        where: { id: enrollment.id },
        data: { endDate: new Date() },
      });
    }

    return NextResponse.json({
      status: true,
      data: {
        enrollment: enrollment
          ? {
              status,
              startDate: enrollment.startDate,
              endDate: enrollment.endDate,
              enrolledAt: enrollment.enrolledAt,
            }
          : null,
        completedLessonIds: completedLessons.map((l) => l.lessonId),
        quizAttempts,
        certificate: certificate
          ? {
              id: certificate.id,
              certificateNumber: certificate.certificateNumber,
              downloadUrl: `/api/students/certificate/${certificate.id}/download`,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
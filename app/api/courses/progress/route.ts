// app/api/courses/progress/route.ts
//
// Tracks a student's lesson/quiz progress on the Student-based models
// (StudentLessonProgress / StudentModuleProgress / StudentQuizAttempt /
// StudentCourseEnrollment — the ones that actually exist in schema.prisma
// and that the certificate-issuance module already reads). After any
// completion event, checkAndIssueCertificate() is called; it's a safe
// no-op unless the course just became fully complete.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentIdFromSession } from "@/lib/auth";
import { checkAndIssueCertificate } from "@/modules/certificate-issuance/certificateIssuance.service";

export async function POST(req: NextRequest) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, lessonId, quizId, action, score, passed, answers } = body;

    if (!courseId) {
      return NextResponse.json({ status: false, message: "Course ID required" }, { status: 400 });
    }

    // Get or create enrollment
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

    // ── Start course ──────────────────────────────────────────────────
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
      if (!enrollment) {
        return NextResponse.json(
          { status: false, message: "Enrollment not found" },
          { status: 400 }
        );
      }

      const lesson = await prisma.lessons.findUnique({ where: { id: lessonId } });
      if (!lesson) {
        return NextResponse.json(
          { status: false, message: "Lesson not found" },
          { status: 404 }
        );
      }

      const existingProgress = await prisma.studentLessonProgress.findUnique({
        where: { studentId_lessonId: { studentId, lessonId } },
      });

      if (existingProgress?.isCompleted) {
        return NextResponse.json(
          { status: false, message: "Lesson already completed" },
          { status: 400 }
        );
      }

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

      // Roll this lesson up into module completion. checkAndIssueCertificate
      // looks at StudentModuleProgress, not individual lessons, so this
      // rollup has to happen before we call it.
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

      const course = await prisma.courses.findUnique({
        where: { id: courseId },
        include: { modules: { where: { isActive: true }, include: { lessons: true } } },
      });
      const totalLessons = course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
      const completedLessons = await prisma.studentLessonProgress.count({
        where: {
          studentId,
          isCompleted: true,
          lesson: { moduleId: { in: (course?.modules ?? []).map((m) => m.id) } },
        },
      });

      // 🔑 Auto-issue the certificate the moment the course becomes fully
      // complete. Safe to call unconditionally — no-op if not done yet or
      // if a certificate already exists.
      const certificate = await checkAndIssueCertificate(studentId, courseId);

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
      });
    }

    // ── Submit a quiz ────────────────────────────────────────────────
    if (action === "submit_quiz" && quizId) {
      if (!enrollment) {
        return NextResponse.json(
          { status: false, message: "Enrollment not found" },
          { status: 400 }
        );
      }

      const existingAttempt = await prisma.studentQuizAttempt.findUnique({
        where: { studentId_quizId: { studentId, quizId } },
      });

      if (existingAttempt) {
        return NextResponse.json(
          { status: false, message: "Quiz already attempted. Only one attempt allowed." },
          { status: 400 }
        );
      }

      const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
      if (!quiz) {
        return NextResponse.json({ status: false, message: "Quiz not found" }, { status: 404 });
      }

      const attempt = await prisma.studentQuizAttempt.create({
        data: {
          studentId,
          quizId,
          enrollmentId: enrollment.id,
          score: score || 0,
          isPassed: !!passed,
        },
      });

      if (answers && typeof answers === "object") {
        for (const [questionId, optionId] of Object.entries(answers)) {
          const option = await prisma.option.findFirst({
            where: { id: optionId as string, isCorrect: true },
          });
          await prisma.studentQuizAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId,
              optionId: optionId as string,
              isCorrect: !!option,
            },
          });
        }
      }

      let certificate = null;
      if (passed) {
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

        // 🔑 Same auto-issue hook as the lesson path — covers the case
        // where the final quiz is the last thing completing the course.
        certificate = await checkAndIssueCertificate(studentId, courseId);
      }

      return NextResponse.json({
        status: true,
        message: passed ? "Quiz passed! Great job! 🎉" : "Quiz submitted. Check the answers below.",
        attemptId: attempt.id,
        certificateIssued: !!certificate,
        certificateId: certificate?.id ?? null,
      });
    }

    return NextResponse.json({ status: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ status: false, message: "Course ID required" }, { status: 400 });
    }

    const enrollment = await prisma.studentCourseEnrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: { modules: { where: { isActive: true }, select: { id: true } } },
    });
    const moduleIds = (course?.modules ?? []).map((m) => m.id);

    const completedLessons = await prisma.studentLessonProgress.findMany({
      where: {
        studentId,
        isCompleted: true,
        lesson: { moduleId: { in: moduleIds } },
      },
      select: { lessonId: true },
    });

    const quizzes = await prisma.quiz.findMany({
      where: { moduleId: { in: moduleIds } },
      select: { id: true },
    });
    const quizAttempts = await prisma.studentQuizAttempt.findMany({
      where: { studentId, quizId: { in: quizzes.map((q) => q.id) } },
      select: { quizId: true, score: true, isPassed: true, createdAt: true },
    });

    // Let the frontend know immediately if a certificate already exists
    // for this course, so CoursePlayer can show a "Download Certificate"
    // state without a separate round trip.
    const certificate = await prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    return NextResponse.json({
      status: true,
      data: {
        enrollment: enrollment
          ? {
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
              downloadUrl: `/api/student/certificate/${certificate.id}/download`,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
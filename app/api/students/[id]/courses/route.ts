// // app/api/students/[id]/courses/route.ts
// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/paseto";

// // Helper to get user from token
// async function getUserFromToken(req: NextRequest) {
//   let token = req.headers.get("authorization")?.replace("Bearer ", "");
  
//   if (!token) {
//     token = req.cookies.get("token")?.value;
//   }
  
//   if (!token) return null;
  
//   try {
//     const payload = await verifyToken(token);
//     if (!payload || !payload.id) return null;
    
//    // const studentId = typeof payload.id === 'number' ? payload.id : parseInt(payload.id);
//       const studentId =
//   typeof payload.id === "number"
//     ? payload.id
//     : parseInt(String(payload.id));
//     // Get or create User record for this student
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email: payload.studentEmail || `${payload.username}@student.local` },
//           { email: `${payload.username}@student.local` }
//         ]
//       },
//     });
    
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           name: `${payload.firstName} ${payload.lastName}`,
//           //email: payload.studentEmail || `${payload.username}@student.local`,
//           email:
//   typeof payload.studentEmail === "string" && payload.studentEmail
//     ? payload.studentEmail
//     : `${String(payload.username)}@student.local`,
//           password: `STUDENT_${studentId}`,
//           role: "STUDENT",
//           isActive: true,
//         },
//       });
//     }
    
//     return { user, studentId };
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     return null;
//   }
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { status: false, message: "Student ID is required" },
//         { status: 400 }
//       );
//     }

//     const studentIdNumber = parseInt(id, 10);
//     if (isNaN(studentIdNumber)) {
//       return NextResponse.json(
//         { status: false, message: "Invalid student ID" },
//         { status: 400 }
//       );
//     }

//     // Get authenticated user
//     const auth = await getUserFromToken(req);
//     if (!auth || auth.studentId !== studentIdNumber) {
//       return NextResponse.json(
//         { status: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { user, studentId: authStudentId } = auth;

//     // ── Find student ──────────────────────────────────────────────────────────
//     const student = await prisma.student.findUnique({
//       where: { id: studentIdNumber },
//       select: {
//         standard: true,
//         status: true,
//         firstName: true,
//         lastName: true,
//       },
//     });

//     if (!student) {
//       return NextResponse.json(
//         { status: false, message: "Student not found" },
//         { status: 404 }
//       );
//     }

//     if (student.status !== "Active") {
//       return NextResponse.json(
//         { status: false, message: "Student account is not active" },
//         { status: 403 }
//       );
//     }

//     // ── Query params ──────────────────────────────────────────────────────────
//     const { searchParams } = new URL(req.url);
//     const page           = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
//     const limit          = Math.max(1, parseInt(searchParams.get("limit") || "9", 10));
//     const search         = searchParams.get("search")?.trim() || "";
//     const progressFilter = searchParams.get("status") || "all";
//     const skip           = (page - 1) * limit;

//     // ── Build where clause ────────────────────────────────────────────────────
//     const AND: any[] = [
//       { status: "Published" },
//       {
//         grades: {
//           some: {
//             gradeId: student.standard,
//           },
//         },
//       },
//     ];

//     if (search) {
//       AND.push({
//         OR: [
//           { title:       { contains: search, mode: "insensitive" } },
//           { description: { contains: search, mode: "insensitive" } },
//         ],
//       });
//     }

//     // ── Fetch courses with full module/lesson data for progress calculation ───
//     const [courses, total] = await Promise.all([
//       prisma.courses.findMany({
//         where: { AND },
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         include: {
//           courseCategory: { select: { id: true, name: true } },
//           courseLevel:    { select: { id: true, name: true } },
//           durationType:   { select: { value: true, unit: true } },
//           modules: {
//             where: { isActive: true },
//             include: {
//               lessons: { 
//                 where: { isActive: true },
//                 select: { id: true, title: true }
//               },
//               quiz: { select: { id: true } },
//             },
//           },
//         },
//       }),
//       prisma.courses.count({ where: { AND } }),
//     ]);

//     // ── Get all completed lessons for this user ───────────────────────────────
//     const completedLessons = await prisma.userLessonProgress.findMany({
//       where: {
//         userId: user.id,
//         isCompleted: true,
//       },
//       select: { lessonId: true },
//     });

//     const completedLessonIds = new Set(completedLessons.map(l => l.lessonId));

//     // ── Get all quiz attempts for this user ───────────────────────────────────
//     const quizAttempts = await prisma.userQuizAttempt.findMany({
//       where: {
//         userId: user.id,
//       },
//       select: { quizId: true },
//     });

//     const attemptedQuizIds = new Set(quizAttempts.map(q => q.quizId));

//     // ── Get all enrollments for this user ─────────────────────────────────────
//     const enrollments = await prisma.userCourseEnrollment.findMany({
//       where: {
//         userId: user.id,
//       },
//       select: {
//         id: true,
//         courseId: true,
//         startDate: true,
//         endDate: true,
//         enrolledAt: true,
//       },
//     });

//     const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]));

//     // ── Calculate progress for each course ────────────────────────────────────
//     const formattedCourses = await Promise.all(courses.map(async (course) => {
//       // Calculate total lessons in this course
//       const totalLessons = course.modules.reduce(
//         (sum, m) => sum + m.lessons.length,
//         0
//       );

//       // Calculate completed lessons in this course
//       let completedCount = 0;
//       for (const module of course.modules) {
//         for (const lesson of module.lessons) {
//           if (completedLessonIds.has(lesson.id)) {
//             completedCount++;
//           }
//         }
//       }

//       // Calculate quiz attempts in this course
//       let quizAttemptCount = 0;
//       for (const module of course.modules) {
//         if (module.quiz && attemptedQuizIds.has(module.quiz.id)) {
//           quizAttemptCount++;
//         }
//       }

//       const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
//       // Get enrollment if exists
//       const enrollment = enrollmentMap.get(course.id);
      
//       // Determine course status
//       let courseStatus: "Not Started" | "In Progress" | "Completed" = "Not Started";
      
//       if (enrollment) {
//         if (enrollment.endDate) {
//           courseStatus = "Completed";
//         } else if (enrollment.startDate || completedCount > 0) {
//           courseStatus = "In Progress";
//         }
//       } else if (completedCount > 0 || quizAttemptCount > 0) {
//         courseStatus = "In Progress";
//         // Create enrollment if it doesn't exist but there's progress
//         await prisma.userCourseEnrollment.create({
//           data: {
//             userId: user.id,
//             courseId: course.id,
//             enrolledAt: new Date(),
//             ...(completedCount > 0 && { startDate: new Date() }),
//           },
//         }).catch(console.error); // Don't fail if enrollment creation fails
//       }

//       // Auto-mark as completed if all lessons are done and not already completed
//       if (progress === 100 && courseStatus !== "Completed") {
//         courseStatus = "Completed";
//         if (enrollment && !enrollment.endDate) {
//           await prisma.userCourseEnrollment.update({
//             where: { id: enrollment.id },
//             data: { endDate: new Date() },
//           }).catch(console.error);
//         }
//       }

//       // Build duration string
//       const duration = course.durationType
//         ? `${course.durationType.value} ${course.durationType.unit}`
//         : "Self-paced";

//       return {
//         id: course.id,
//         title: course.title,
//         description: course.description ?? "",
//         thumbnail: course.thumbnailUrl ?? null,
//         totalLessons,
//         completedLessons: completedCount,
//         progress,
//         status: courseStatus,
//         category: course.courseCategory
//           ? { id: course.courseCategory.id, name: course.courseCategory.name }
//           : null,
//         level: course.courseLevel
//           ? { id: course.courseLevel.id, name: course.courseLevel.name }
//           : null,
//         duration,
//       };
//     }));

//     // Apply progress filter on formatted list
//     let filtered = formattedCourses;
//     if (progressFilter !== "all") {
//       filtered = formattedCourses.filter((c) => {
//         if (progressFilter === "in-progress") return c.status === "In Progress";
//         if (progressFilter === "completed")   return c.status === "Completed";
//         if (progressFilter === "not-started") return c.status === "Not Started";
//         return true;
//       });
//     }

//     return NextResponse.json({
//       status: true,
//       data: filtered,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//       student: {
//         id: studentIdNumber,
//         name: `${student.firstName} ${student.lastName}`,
//         gradeId: student.standard,
//       },
//     });

//   } catch (err: any) {
//     console.error("Courses API Error:", err);
//     return NextResponse.json(
//       { status: false, message: err.message || "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// app/api/students/[id]/courses/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/paseto";
import { checkAndIssueCertificate } from "modules/certificate-issuance/certificateIssuance.service";

// Verifies the token and returns the authenticated student's id.
// No more shadow `User` record — Student owns progress/enrollment directly now.
async function getStudentIdFromToken(req: NextRequest): Promise<number | null> {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    token = req.cookies.get("token")?.value;
  }

  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    if (!payload || payload.id === undefined || payload.id === null) return null;

    const studentId =
      typeof payload.id === "number" ? payload.id : parseInt(String(payload.id), 10);

    return isNaN(studentId) ? null : studentId;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { status: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    const studentIdNumber = parseInt(id, 10);
    if (isNaN(studentIdNumber)) {
      return NextResponse.json(
        { status: false, message: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Get authenticated student and make sure they're asking about themselves
    const authStudentId = await getStudentIdFromToken(req);
    if (!authStudentId || authStudentId !== studentIdNumber) {
      return NextResponse.json(
        { status: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Find student ──────────────────────────────────────────────────────────
    const student = await prisma.student.findUnique({
      where: { id: studentIdNumber },
      select: {
        standard: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { status: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (student.status !== "Active") {
      return NextResponse.json(
        { status: false, message: "Student account is not active" },
        { status: 403 }
      );
    }

    // ── Query params ──────────────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const page           = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
    const limit           = Math.max(1, parseInt(searchParams.get("limit") || "9", 10));
    const search         = searchParams.get("search")?.trim() || "";
    const progressFilter = searchParams.get("status") || "all";
    const skip           = (page - 1) * limit;

    // ── Build where clause ────────────────────────────────────────────────────
    const AND: any[] = [
      { status: "Published" },
      {
        grades: {
          some: {
            gradeId: student.standard,
          },
        },
      },
    ];

    if (search) {
      AND.push({
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // ── Fetch courses with full module/lesson data for progress calculation ───
    const [courses, total] = await Promise.all([
      prisma.courses.findMany({
        where: { AND },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          courseCategory: { select: { id: true, name: true } },
          courseLevel:    { select: { id: true, name: true } },
          durationType:   { select: { value: true, unit: true } },
          modules: {
            where: { isActive: true },
            include: {
              lessons: {
                where: { isActive: true },
                select: { id: true, title: true }
              },
              quiz: { select: { id: true } },
            },
          },
        },
      }),
      prisma.courses.count({ where: { AND } }),
    ]);

    // ── Get all completed lessons for this student ────────────────────────────
    const completedLessons = await prisma.studentLessonProgress.findMany({
      where: {
        studentId: studentIdNumber,
        isCompleted: true,
      },
      select: { lessonId: true },
    });

    const completedLessonIds = new Set(completedLessons.map(l => l.lessonId));

    // ── Get all quiz attempts for this student ────────────────────────────────
    const quizAttempts = await prisma.studentQuizAttempt.findMany({
      where: {
        studentId: studentIdNumber,
      },
      select: { quizId: true },
    });

    const attemptedQuizIds = new Set(quizAttempts.map(q => q.quizId));

    // ── Get all enrollments for this student ──────────────────────────────────
    const enrollments = await prisma.studentCourseEnrollment.findMany({
      where: {
        studentId: studentIdNumber,
      },
      select: {
        id: true,
        courseId: true,
        startDate: true,
        endDate: true,
        enrolledAt: true,
      },
    });

    const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]));

    // ── Get any certificates already issued to this student ───────────────────
    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: studentIdNumber,
        status: "Issued",
      },
      select: { courseId: true, id: true, certificateNumber: true, pdfUrl: true },
    });

    const certificateMap = new Map(certificates.map(c => [c.courseId, c]));

    // ── Calculate progress for each course ────────────────────────────────────
    const formattedCourses = await Promise.all(courses.map(async (course) => {
      // Calculate total lessons in this course
      const totalLessons = course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );

      // Calculate completed lessons in this course
      let completedCount = 0;
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (completedLessonIds.has(lesson.id)) {
            completedCount++;
          }
        }
      }

      // Calculate quiz attempts in this course
      let quizAttemptCount = 0;
      for (const module of course.modules) {
        if (module.quiz && attemptedQuizIds.has(module.quiz.id)) {
          quizAttemptCount++;
        }
      }

      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Get enrollment if exists
      const enrollment = enrollmentMap.get(course.id);

      // Determine course status
      let courseStatus: "Not Started" | "In Progress" | "Completed" = "Not Started";

      if (enrollment) {
        if (enrollment.endDate) {
          courseStatus = "Completed";
        } else if (enrollment.startDate || completedCount > 0) {
          courseStatus = "In Progress";
        }
      } else if (completedCount > 0 || quizAttemptCount > 0) {
        courseStatus = "In Progress";
        // Create enrollment if it doesn't exist but there's progress
        await prisma.studentCourseEnrollment.create({
          data: {
            studentId: studentIdNumber,
            courseId: course.id,
            enrolledAt: new Date(),
            ...(completedCount > 0 && { startDate: new Date() }),
          },
        }).catch(console.error); // Don't fail if enrollment creation fails
      }

      // Auto-mark as completed if all lessons are done and not already completed
      let certificate = certificateMap.get(course.id) ?? null;

      if (progress === 100 && courseStatus !== "Completed") {
        courseStatus = "Completed";
        if (enrollment && !enrollment.endDate) {
          await prisma.studentCourseEnrollment.update({
            where: { id: enrollment.id },
            data: { endDate: new Date() },
          }).catch(console.error);
        }

        // Course just crossed 100% — generate the certificate PDF now.
        // checkAndIssueCertificate is idempotent (it checks for an existing
        // certificate first), so it's safe to call this every time this
        // route runs, not just the one time completion happens.
        if (!certificate) {
          try {
            const issued = await checkAndIssueCertificate(studentIdNumber, course.id);
            if (issued) {
              certificate = {
                courseId: course.id,
                id: issued.id,
                certificateNumber: issued.certificateNumber,
                pdfUrl: issued.pdfUrl,
              };
            }
          } catch (err) {
            console.error(`Certificate issuance failed for course ${course.id}:`, err);
          }
        }
      }

      // Build duration string
      const duration = course.durationType
        ? `${course.durationType.value} ${course.durationType.unit}`
        : "Self-paced";

      return {
        id: course.id,
        title: course.title,
        description: course.description ?? "",
        thumbnail: course.thumbnailUrl ?? null,
        totalLessons,
        completedLessons: completedCount,
        progress,
        status: courseStatus,
        category: course.courseCategory
          ? { id: course.courseCategory.id, name: course.courseCategory.name }
          : null,
        level: course.courseLevel
          ? { id: course.courseLevel.id, name: course.courseLevel.name }
          : null,
        duration,
        certificate: certificate
          ? {
              id: certificate.id,
              certificateNumber: certificate.certificateNumber,
              downloadUrl: `/api/student/certificates/${certificate.id}/download`,
            }
          : null,
      };
    }));

    // Apply progress filter on formatted list
    let filtered = formattedCourses;
    if (progressFilter !== "all") {
      filtered = formattedCourses.filter((c) => {
        if (progressFilter === "in-progress") return c.status === "In Progress";
        if (progressFilter === "completed")   return c.status === "Completed";
        if (progressFilter === "not-started") return c.status === "Not Started";
        return true;
      });
    }

    return NextResponse.json({
      status: true,
      data: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      student: {
        id: studentIdNumber,
        name: `${student.firstName} ${student.lastName}`,
        gradeId: student.standard,
      },
    });

  } catch (err: any) {
    console.error("Courses API Error:", err);
    return NextResponse.json(
      { status: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
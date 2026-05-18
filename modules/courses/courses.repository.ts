
// import { prisma } from "@/lib/prisma";
// import { CreateCourseDto, UpdateCourseDto } from "./courses.types";

// const courseInclude = {
//   courseCategory: { select: { id: true, name: true } },
//   courseLevel:    { select: { id: true, name: true } },
//   validityPeriod: { select: { id: true, name: true } },
//   modules: {
//     orderBy: { order: "asc" as const },
//     select:  { id: true, title: true, type: true, order: true, isActive: true },
//   },
// } as const;

// export const getCoursesRepo = (where: any, skip: number, take: number) =>
//   prisma.courses.findMany({
//     where,
//     skip,
//     take,
//     orderBy: { createdAt: "desc" },
//     include: courseInclude,
//   });

// export const countCoursesRepo = (where: any) =>
//   prisma.courses.count({ where });

// export const findCourseByIdRepo = (id: string) =>
//   prisma.courses.findUnique({ where: { id }, include: courseInclude });

// export const createCourseRepo = (data: CreateCourseDto) => {
//   const { modules,gradeIds, ...courseData } = data;

//   return prisma.courses.create({
//     data: {
//       ...courseData,
//        ...(gradeIds && gradeIds.length > 0 && {
//         grades: {
//           create: gradeIds.map((gradeId) => ({
//             gradeId,
//           })),
//         },
//       }),
//       ...(modules && modules.length > 0 && {
//         modules: {
//           create: modules.map((m) => {
//             const base = {
//               title:       m.title,
//               type:        m.type,
//               order:       m.order,
//               description: m.description ?? "",
//             };

//             // ── LESSON ──────────────────────────────────────────────────────
//             if (m.type === "LESSON") {
//               return {
//                 ...base,
//                 ...(m.lessons && m.lessons.length > 0 && {
//                   lessons: {
//                     create: m.lessons.map((l) => ({
//                       title:       l.title,
//                       contentType: l.contentType,
//                       fileUrl: l.contentType === "VIDEO"
//                         ? (l.videoLinks?.[0] ?? null)
//                         : (l.fileUrl ?? null),
//                       order: l.order,
//                     })),
//                   },
//                 }),
//               };
//             }

//             // ── REVISION ─────────────────────────────────────────────────────
//             if (m.type === "REVISION") {
//               const videoLesson = m.lessons?.find(l => l.contentType === "VIDEO");
//               return {
//                 ...base,
//                 revision: {
//                   create: {
//                     title: m.title,
//                     ...(videoLesson && {
//                       contents: {
//                         create: [{
//                           contentType: "VIDEO" as const,
//                           fileUrl:     videoLesson.videoLinks?.[0] ?? "",
//                           order:       1,
//                         }],
//                       },
//                     }),
//                   },
//                 },
//               };
//             }

//             // ── QUIZ / FINAL_QUIZ ─────────────────────────────────────────────
//             if (m.type === "QUIZ" || m.type === "FINAL_QUIZ") {
//               const questions = m.questions ?? [];

//               // Calculate totalMarks = sum of all question points
//               const totalMarks   = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
//               // Default passingMarks = 60% of total (minimum 1)
//               const passingMarks = Math.max(1, Math.round(totalMarks * 0.6));

//               return {
//                 ...base,
//                 quiz: {
//                   create: {
//                     passingMarks,
//                     totalMarks: totalMarks || 1,
//                     ...(questions.length > 0 && {
//                       questions: {
//                         create: questions.map((q, qi) => ({
//                           question:     q.text,
//                           order:        qi + 1,
//                           points:       q.points ?? 1,
//                           difficulty:   (q.difficulty   ?? null) as any,
//                           bloomLevel:   (q.bloomLevel   ?? null) as any,
//                           questionType: (q.questionType ?? null) as any,
//                           codeSnippet:  q.codeSnippet  ?? null,
//                           codeLanguage: q.codeLanguage ?? null,
//                           explanation:  q.explanation  ?? null,
//                           options: {
//                             create: q.options.map((o) => ({
//                               text:      o.text,
//                               isCorrect: o.isCorrect,
//                               order:     o.order,
//                             })),
//                           },
//                         })),
//                       },
//                     }),
//                   },
//                 },
//               };
//             }

//             return base;
//           }),
//         },
//       }),
//     },
//     include: courseInclude,
//   });
// };

// export const updateCourseRepo = (id: string, data: UpdateCourseDto) =>
//   prisma.courses.update({ where: { id }, data, include: courseInclude });

// export const deleteCourseRepo = (id: string) =>
//   prisma.courses.delete({ where: { id } });
import { prisma } from "@/lib/prisma";
import { CreateCourseDto, UpdateCourseDto } from "./courses.types";

// ─── Shared include for list / basic detail ────────────────────────────────────

const courseInclude = {
  courseCategory: { select: { id: true, name: true } },
  courseLevel:    { select: { id: true, name: true } },
  durationType:   { select: { id: true, value: true, unit: true } }, 
  modules: {
    orderBy: { order: "asc" as const },
    select:  { id: true, title: true, type: true, order: true, isActive: true },
  },
} as const;

// ─── Full include for edit page (all nested data) ─────────────────────────────

const courseEditInclude = {
  courseCategory: { select: { id: true, name: true } },
  courseLevel:    { select: { id: true, name: true } },
 durationType:   { select: { id: true, value: true, unit: true }  }, 
  grades: { select: { gradeId: true } },
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
      },
      revision: {
        include: {
          contents: { orderBy: { order: "asc" as const } },
        },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" as const },
            include: {
              options: { orderBy: { order: "asc" as const } },
            },
          },
        },
      },
    },
  },
} as const;

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export const getCoursesRepo = (where: any, skip: number, take: number) =>
  prisma.courses.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: courseInclude,
  });

export const countCoursesRepo = (where: any) =>
  prisma.courses.count({ where });

export const findCourseByIdRepo = (id: string) =>
  prisma.courses.findUnique({ where: { id }, include: courseInclude });

/** Full fetch for edit page — includes lessons, revision contents, quiz questions + options */
export const findCourseForEditRepo = (id: string) =>
  prisma.courses.findUnique({ where: { id }, include: courseEditInclude });

// ─── Shared module builder (used by both create and update) ───────────────────

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the existing buildModuleCreate function in courses.repository.ts
// with this version.  Everything else in the file stays the same.
// ─────────────────────────────────────────────────────────────────────────────

function buildModuleCreate(m: NonNullable<CreateCourseDto["modules"]>[number]) {
  const base = {
    title:       m.title,
    type:        m.type,
    order:       m.order,
    description: m.description ?? "",
  };

  // ── LESSON ────────────────────────────────────────────────────────────────
  if (m.type === "LESSON") {
    return {
      ...base,
      ...(m.lessons && m.lessons.length > 0 && {
        lessons: {
          create: m.lessons.map((l) => ({
            title:       l.title,
            contentType: l.contentType,
            fileUrl:
              l.contentType === "VIDEO"
                ? (l.videoLinks?.[0] ?? null)
                : (l.fileUrl ?? null),
            order: l.order,
          })),
        },
      }),
    };
  }

  // ── REVISION ──────────────────────────────────────────────────────────────
  if (m.type === "REVISION") {
    const videoLesson = m.lessons?.find((l) => l.contentType === "VIDEO");
    return {
      ...base,
      revision: {
        create: {
          title: m.title,
          ...(videoLesson && {
            contents: {
              create: [
                {
                  contentType: "VIDEO" as const,
                  fileUrl:     videoLesson.videoLinks?.[0] ?? "",
                  order:       1,
                },
              ],
            },
          }),
        },
      },
    };
  }

  // ── QUIZ / FINAL_QUIZ ─────────────────────────────────────────────────────
  if (m.type === "QUIZ" || m.type === "FINAL_QUIZ") {
    const questions    = m.questions ?? [];
    const totalMarks   = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
    const passingMarks = Math.max(1, Math.round(totalMarks * 0.6));

    return {
      ...base,
      quiz: {
        create: {
          passingMarks,
          totalMarks: totalMarks || 1,
          ...(questions.length > 0 && {
            questions: {
              create: questions.map((q, qi) => ({
                // ── FIX: conditionally set question text and image ──
                question:     q.inputMode === "text" ? (q.text ?? "") : "",
                inputMode:    (q.inputMode ?? "text") as any,
                questionImage: q.inputMode === "image" ? (q.questionImage ?? null) : null,
                order:        qi + 1,
                points:       q.points ?? 1,
                difficulty:   (q.difficulty   ?? null) as any,
                bloomLevel:   (q.bloomLevel   ?? null) as any,
                questionType: (q.questionType ?? null) as any,
                codeSnippet:  q.codeSnippet  ?? null,
                codeLanguage: q.codeLanguage ?? null,
                explanation:  q.explanation  ?? null,
                options: {
                  create: q.options.map((o, oi) => ({
                    // ── FIX: conditionally set option text and image ──
                    text:      o.inputMode === "text" ? (o.text ?? "") : "",
                    isCorrect: o.isCorrect,
                    order:     oi + 1,
                    inputMode: (o.inputMode ?? "text") as any,
                    imageData: o.inputMode === "image" ? (o.imageData ?? null) : null,
                  })),
                },
              })),
            },
          }),
        },
      },
    };
  }

  return base;
}
// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createCourseRepo = (data: CreateCourseDto) => {
  const { modules, gradeIds, ...courseData } = data;

  return prisma.courses.create({
    data: {
      title: courseData.title,
      description: courseData.description,
      categoryId: courseData.categoryId,
      levelId: courseData.levelId,
      status: courseData.status,
      createdBy: courseData.createdBy,
      thumbnailUrl: courseData.thumbnailUrl,
      durationTypeId: courseData.durationTypeId, // Map to the correct field
      ...(gradeIds && gradeIds.length > 0 && {
        grades: {
          create: gradeIds.map((gradeId) => ({ gradeId })),
        },
      }),
      ...(modules && modules.length > 0 && {
        modules: {
          create: modules.map(buildModuleCreate),
        },
      }),
    },
    include: courseInclude,
  });
};
// ─── UPDATE (full — replaces grades + modules) ────────────────────────────────

// ─── UPDATE (full — replaces grades + modules) ────────────────────────────────
// REPLACE the existing updateCourseFullRepo function with this version.

export const updateCourseFullRepo = async (id: string, data: CreateCourseDto) => {
  const { modules, gradeIds, ...courseData } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Update scalar course fields + replace grades
    //    Prisma requires relation fields, not raw FK strings.
    //    Strip non-schema keys (schedule, intermediateTests, eligibilityRules)
    //    and map FK names → Prisma connect syntax.
    await tx.courses.update({
      where: { id },
      data: {
        title:        courseData.title,
        description:  courseData.description  ?? undefined,
        status:       courseData.status       ?? undefined,
        createdBy:    courseData.createdBy    ?? undefined,
        thumbnailUrl: courseData.thumbnailUrl ?? undefined,

        // Relation fields — use connect instead of raw FK
        ...(courseData.categoryId && {
          courseCategory: { connect: { id: courseData.categoryId } },
        }),
        ...(courseData.levelId && {
          courseLevel: { connect: { id: courseData.levelId } },
        }),
        ...(courseData.durationTypeId && {
          durationType: { connect: { id: courseData.durationTypeId } },
        }),

        // Replace grades
        grades: {
          deleteMany: {},
          ...(gradeIds && gradeIds.length > 0 && {
            create: gradeIds.map((gradeId) => ({ gradeId })),
          }),
        },
      },
    });

    // 2. Drop all existing modules (cascades to lessons, revision/contents, quiz/questions/options)
    await tx.modules.deleteMany({ where: { courseId: id } });

    // 3. Recreate modules
    if (modules && modules.length > 0) {
      for (const m of modules) {
        const moduleData: any = buildModuleCreate(m);
        await tx.modules.create({
          data: { ...moduleData, courseId: id },
        });
      }
    }

    // 4. Return the fully-updated course
    return tx.courses.findUnique({ where: { id }, include: courseInclude });
  });
};

// ─── Simple field-only update (kept for backwards compat) ─────────────────────
export const updateCourseRepo = (id: string, data: UpdateCourseDto) =>
  prisma.courses.update({ where: { id }, data, include: courseInclude });

export const deleteCourseRepo = (id: string) =>
  prisma.courses.delete({ where: { id } });
// In courses.repository.ts - add this function

// In courses.repository.ts - Add this function if not already present

export const getCoursesByGradeWithFullDetailsRepo = async (gradeId: string, query: any) => {
  const page   = Number(query.page)  > 0 ? Number(query.page)  : 1;
  const limit  = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const search     = query.search     || "";
  const status     = query.status     || "Published"; // Default to published for students
  const categoryId = query.categoryId || undefined;
  const levelId    = query.levelId    || undefined;

  const skip = (page - 1) * limit;

  const where: any = {
    grades: {
      some: {
        gradeId: gradeId
      }
    }
  };
  
  if (search)     where.title      = { contains: search, mode: "insensitive" };
  if (status)     where.status     = status;
  if (categoryId) where.categoryId = categoryId;
  if (levelId)    where.levelId    = levelId;

  const [total, data] = await Promise.all([
    prisma.courses.count({ where }),
    prisma.courses.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: courseEditInclude, // This includes ALL: lessons, revision, quizzes, questions, options
    }),
  ]);

  return {
    data,
    meta: { 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit) 
    },
  };
};
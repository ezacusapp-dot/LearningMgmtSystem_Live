

// // modules/exams/exams.service.ts
// import { prisma } from "@/lib/prisma";
// import {
//   getExamsRepo,
//   countExamsRepo,
//   findExamByIdRepo,
//   createExamRepo,
//   updateExamRepo,
//   replaceExamSectionsRepo,
//   replaceExamQuestionsRepo,
//   addQuestionToSectionRepo,
//   bulkUpdateSectionQuestionsRepo,
//   assignCourseRepo,
//   unassignCourseRepo,
//   deleteExamRepo,
//   getCoursesForDropdownRepo,
//   buildWhere,
//   sanitizeExamForStudent,
// } from "./exams.repository";
// import { CreateExamDto, UpdateExamDto, ExamQueryParams } from "./exams.types";

// export const getExamsService = async (query: ExamQueryParams) => {
//   const page = Math.max(Number(query.page) || 1, 1);
//   const limit = Math.max(Number(query.limit) || 10, 1);
//   const skip = (page - 1) * limit;
//   const where = buildWhere(query);

//   const [total, data] = await Promise.all([
//     countExamsRepo(where),
//     getExamsRepo(where, skip, limit),
//   ]);

//   return {
//     data,
//     meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//   };
// };

// export const getExamByIdService = async (id: string) => {
//   const exam = await findExamByIdRepo(id);
//   if (!exam) throw new Error("Exam not found");
//   return exam;
// };

// export const createExamService = async (data: CreateExamDto) => {
//   if (data.courseId) {
//     const course = await prisma.courses.findUnique({ where: { id: data.courseId } });
//     if (!course) throw new Error("Course not found");
//   }

//   if (data.passingMarks > data.totalMarks) {
//     throw new Error("Passing marks cannot exceed total marks");
//   }

//   return createExamRepo(data);
// };

// export const updateExamService = async (id: string, data: UpdateExamDto) => {
//   const existing = await findExamByIdRepo(id);
//   if (!existing) throw new Error("Exam not found");

//   if (data.courseId) {
//     const course = await prisma.courses.findUnique({ where: { id: data.courseId } });
//     if (!course) throw new Error("Course not found");
//   }

//   const newTotal = data.totalMarks ?? existing.totalMarks;
//   const newPassing = data.passingMarks ?? existing.passingMarks;
//   if (newPassing > newTotal) {
//     throw new Error("Passing marks cannot exceed total marks");
//   }

//   return updateExamRepo(id, data);
// };

// export const replaceExamSectionsService = async (
//   id: string,
//   sections: NonNullable<CreateExamDto["sections"]>
// ) => {
//   const existing = await findExamByIdRepo(id);
//   if (!existing) throw new Error("Exam not found");

//   return replaceExamSectionsRepo(id, sections);
// };

// // Replace all questions on an exam (flat, no section grouping required)
// export const replaceExamQuestionsService = async (
//   examId: string,
//   questions: NonNullable<CreateExamDto["questions"]>
// ) => {
//   const exam = await findExamByIdRepo(examId);
//   if (!exam) throw new Error("Exam not found");

//   if (!questions || !Array.isArray(questions) || questions.length === 0) {
//     throw new Error("At least one question is required");
//   }

//   return replaceExamQuestionsRepo(examId, questions);
// };

// export const addQuestionToSectionService = async (
//   examId: string,
//   sectionId: string,
//   question: NonNullable<CreateExamDto["questions"]>[0]
// ) => {
//   const exam = await findExamByIdRepo(examId);
//   if (!exam) throw new Error("Exam not found");

//   // The repo already recomputes the exam's totalMarks after inserting.
//   return addQuestionToSectionRepo(examId, sectionId, question);
// };

// export const bulkUpdateSectionQuestionsService = async (
//   examId: string,
//   sectionId: string,
//   questions: NonNullable<CreateExamDto["questions"]>
// ) => {
//   const exam = await findExamByIdRepo(examId);
//   if (!exam) throw new Error("Exam not found");

//   return bulkUpdateSectionQuestionsRepo(examId, sectionId, questions);
// };

// /**
//  * Student-safe exam payload (no answers, no explanations).
//  *
//  * The date window is intentionally NOT enforced here: the instructions page
//  * needs this data to show "opens on…" / "closed on…" notices. Enforce the
//  * window where it matters — when an attempt starts and when it is submitted
//  * (POST /api/exams/[id]/attempts).
//  */
// export const getExamForStudentService = async (id: string) => {
//   const exam = await findExamByIdRepo(id);
//   if (!exam) throw new Error("Exam not found");
//   if (exam.status !== "Active") throw new Error("Exam is not active");

//   return sanitizeExamForStudent(exam);
// };

// export const assignCourseService = async (examId: string, courseId: string) => {
//   const [exam, course] = await Promise.all([
//     findExamByIdRepo(examId),
//     prisma.courses.findUnique({ where: { id: courseId } }),
//   ]);
//   if (!exam) throw new Error("Exam not found");
//   if (!course) throw new Error("Course not found");
//   return assignCourseRepo(examId, courseId);
// };

// export const unassignCourseService = async (examId: string) => {
//   const exam = await findExamByIdRepo(examId);
//   if (!exam) throw new Error("Exam not found");
//   return unassignCourseRepo(examId);
// };

// export const deleteExamService = async (id: string) => {
//   const exam = await findExamByIdRepo(id);
//   if (!exam) throw new Error("Exam not found");
//   return deleteExamRepo(id);
// };

// export const getCoursesForDropdownService = () => getCoursesForDropdownRepo();


// modules/exams/exams.service.ts
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { pickByMarks, shuffle, QUESTION_TYPES } from "./blueprint";
import {
  getExamsRepo,
  countExamsRepo,
  findExamByIdRepo,
  createExamRepo,
  updateExamRepo,
  replaceExamSectionsRepo,
  replaceExamQuestionsRepo,
  addQuestionToSectionRepo,
  bulkUpdateSectionQuestionsRepo,
  assignCourseRepo,
  unassignCourseRepo,
  deleteExamRepo,
  getCoursesForDropdownRepo,
  buildWhere,
  sanitizeQuestionForStudent,
  sanitizeExamInfoForStudent,
} from "./exams.repository";
import {
  CreateExamDto,
  UpdateExamDto,
  ExamQueryParams,
  ExamQuestionDto,
  ExamBlueprintRuleDto,
  SubmitAnswerDto,
} from "./exams.types";

const sumMarks = (rules: { marks: number }[]) => rules.reduce((s, r) => s + r.marks, 0);

// ─── Admin side ──────────────────────────────────────────────────────────────

export const getExamsService = async (query: ExamQueryParams) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  const [total, data] = await Promise.all([countExamsRepo(where), getExamsRepo(where, skip, limit)]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getExamByIdService = async (id: string) => {
  const exam = await findExamByIdRepo(id);
  if (!exam) throw new Error("Exam not found");
  return exam;
};

export const createExamService = async (data: CreateExamDto) => {
  if (data.courseId) {
    const course = await prisma.courses.findUnique({ where: { id: data.courseId } });
    if (!course) throw new Error("Course not found");
  }
  if (data.passingMarks > data.totalMarks) throw new Error("Passing marks cannot exceed total marks");
  if (data.blueprint?.length && sumMarks(data.blueprint) !== data.totalMarks) {
    throw new Error(`Blueprint marks (${sumMarks(data.blueprint)}) must equal total marks (${data.totalMarks})`);
  }
  return createExamRepo(data);
};

export const updateExamService = async (id: string, data: UpdateExamDto) => {
  const existing = await findExamByIdRepo(id);
  if (!existing) throw new Error("Exam not found");

  if (data.courseId) {
    const course = await prisma.courses.findUnique({ where: { id: data.courseId } });
    if (!course) throw new Error("Course not found");
  }

  const newTotal = data.totalMarks ?? existing.totalMarks;
  const newPassing = data.passingMarks ?? existing.passingMarks;
  if (newPassing > newTotal) throw new Error("Passing marks cannot exceed total marks");

  // An exam can only go live when its paper blueprint is complete and matches the total marks
  if (data.status === "Active") {
    const rules = existing.blueprint ?? [];
    if (!rules.length) throw new Error("Add questions and set the blueprint before activating this exam");
    if (sumMarks(rules) !== newTotal) {
      throw new Error(`Blueprint total (${sumMarks(rules)}) must equal exam total marks (${newTotal}). Update the questions page.`);
    }
  }

  return updateExamRepo(id, data);
};

export const replaceExamSectionsService = async (id: string, sections: NonNullable<CreateExamDto["sections"]>) => {
  const existing = await findExamByIdRepo(id);
  if (!existing) throw new Error("Exam not found");
  return replaceExamSectionsRepo(id, sections);
};

/** Save the question pool + blueprint. Blocks the save when marks don't add up. */
export const replaceExamQuestionsService = async (
  examId: string,
  questions: ExamQuestionDto[],
  blueprint: ExamBlueprintRuleDto[]
) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");
  if (!questions?.length) throw new Error("At least one question is required");
  if (!blueprint?.length) throw new Error("Set marks for at least one question type");

  const paperMarks = sumMarks(blueprint);
  if (paperMarks !== exam.totalMarks) {
    throw new Error(`Blueprint marks (${paperMarks}) must equal the exam total marks (${exam.totalMarks})`);
  }
  if (exam.passingMarks > paperMarks) {
    throw new Error(`Passing marks (${exam.passingMarks}) exceed the paper marks (${paperMarks})`);
  }

  return replaceExamQuestionsRepo(examId, questions, blueprint);
};

export const addQuestionToSectionService = async (examId: string, sectionId: string, question: ExamQuestionDto) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");
  return addQuestionToSectionRepo(examId, sectionId, question);
};

export const bulkUpdateSectionQuestionsService = async (
  examId: string,
  sectionId: string,
  questions: ExamQuestionDto[]
) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");
  return bulkUpdateSectionQuestionsRepo(examId, sectionId, questions);
};

export const assignCourseService = async (examId: string, courseId: string) => {
  const [exam, course] = await Promise.all([
    findExamByIdRepo(examId),
    prisma.courses.findUnique({ where: { id: courseId } }),
  ]);
  if (!exam) throw new Error("Exam not found");
  if (!course) throw new Error("Course not found");
  return assignCourseRepo(examId, courseId);
};

export const unassignCourseService = async (examId: string) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");
  return unassignCourseRepo(examId);
};

export const deleteExamService = async (id: string) => {
  const exam = await findExamByIdRepo(id);
  if (!exam) throw new Error("Exam not found");
  return deleteExamRepo(id);
};

export const getCoursesForDropdownService = () => getCoursesForDropdownRepo();

// ─── Student side ────────────────────────────────────────────────────────────

/**
 * Exam info for the instructions page (title, marks, duration, blueprint).
 * The question pool is NOT returned. The date window is enforced when the attempt starts.
 */
export const getExamForStudentService = async (id: string) => {
  const exam = await findExamByIdRepo(id);
  if (!exam) throw new Error("Exam not found");
  if (exam.status !== "Active") throw new Error("Exam is not active");
  return sanitizeExamInfoForStudent(exam);
};

const paperInclude = {
  questions: {
    orderBy: { order: "asc" as const },
    include: { question: { include: { options: { orderBy: { order: "asc" as const } } } } },
  },
};

const toPaper = (exam: any, attempt: any) => {
  const startedAt: Date = attempt.startedAt ?? attempt.createdAt;
  const questions = attempt.questions.map((aq: any) => sanitizeQuestionForStudent(aq.question));
  return {
    attemptId: attempt.id,
    title: exam.title,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    startedAt,
    endsAt: new Date(startedAt.getTime() + exam.duration * 60_000), // drive the timer from this
    questions,
  };
};

/**
 * Start (or resume) an attempt and build THIS student's random paper:
 *   for every blueprint rule -> pick random questions of that type whose marks add up
 *   to EXACTLY rule.marks. The pick is saved, so a refresh returns the same paper.
 */
export const startExamAttemptService = async (examId: string, studentId: number) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { blueprint: true } });
  if (!exam) throw new Error("Exam not found");
  if (exam.status !== "Active") throw new Error("Exam is not active");

  const now = new Date();
  if (exam.startDate && now < exam.startDate) throw new Error("Exam has not started yet");
  if (exam.endDate && now > exam.endDate) throw new Error("Exam has ended");

  // Unfinished attempt -> same paper again
  const open = await prisma.examAttempt.findFirst({
    where: { examId, studentId, completedAt: null },
    include: paperInclude,
  });
  if (open) return toPaper(exam, open);

  const used = await prisma.examAttempt.count({ where: { examId, studentId } });
  if (exam.maxAttempts && used >= exam.maxAttempts) throw new Error("Maximum attempts reached");

  if (!exam.blueprint.length) throw new Error("Exam is not ready: no paper blueprint is set");

  const pool = await prisma.examQuestion.findMany({
    where: { examId, isArchived: false },
    select: { id: true, questionType: true, points: true },
  });

  const rnd = (n: number) => randomInt(n); // cryptographically strong random
  const rules = [...exam.blueprint].sort(
    (a, b) => QUESTION_TYPES.indexOf(a.questionType as any) - QUESTION_TYPES.indexOf(b.questionType as any)
  );

  let picked: { id: string; points: number }[] = [];
  for (const rule of rules) {
    const ofType = pool.filter((q) => q.questionType === rule.questionType);
    const chosen = pickByMarks(ofType, rule.marks, rnd);
    if (!chosen) {
      throw new Error(`Exam is not ready: cannot build ${rule.marks} marks of ${rule.questionType} questions`);
    }
    picked.push(...shuffle(chosen, rnd));
  }

  const paperMarks = picked.reduce((s, q) => s + q.points, 0);
  if (paperMarks !== exam.totalMarks) {
    throw new Error(`Exam is not ready: paper is ${paperMarks} marks but exam total is ${exam.totalMarks}`);
  }

  if (exam.randomizeQuestions) picked = shuffle(picked, rnd); // otherwise grouped by type

  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      startedAt: now,
      questions: { create: picked.map((q, i) => ({ questionId: q.id, order: i + 1 })) },
    },
    include: paperInclude,
  });

  return toPaper(exam, attempt);
};

/** Score an attempt on the server. Marks and correctness NEVER come from the client. */
export const submitExamAttemptService = async (
  attemptId: string,
  studentId: number,
  answers: SubmitAnswerDto[]
) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: true, questions: { include: { question: { include: { options: true } } } } },
  });
  if (!attempt || attempt.studentId !== studentId) throw new Error("Attempt not found");
  if (attempt.completedAt) throw new Error("This attempt was already submitted");

  const paper = new Map(attempt.questions.map((aq) => [aq.questionId, aq.question]));
  const seen = new Set<string>();
  const rows: { attemptId: string; questionId: string; optionId: string; isCorrect: boolean }[] = [];
  let score = 0;

  for (const a of answers) {
    const q = paper.get(a.questionId);               // ignore questions that were not in this paper
    if (!q || !a.optionId || seen.has(q.id)) continue;
    const opt = q.options.find((o) => o.id === a.optionId); // ignore options of other questions
    if (!opt) continue;
    seen.add(q.id);
    if (opt.isCorrect) score += q.points;
    rows.push({ attemptId, questionId: q.id, optionId: opt.id, isCorrect: opt.isCorrect });
  }

  const now = new Date();
  const totalMarks = attempt.exam.totalMarks;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0;
  const isPassed = score >= attempt.exam.passingMarks;
  const started = attempt.startedAt ?? attempt.createdAt;

  await prisma.$transaction([
    prisma.examAttemptAnswer.createMany({ data: rows }),
    prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        percentage,
        isPassed,
        completedAt: now,
        timeTaken: Math.round((now.getTime() - started.getTime()) / 1000),
      },
    }),
  ]);

  return { attemptId, score, totalMarks, percentage, isPassed, unanswered: attempt.questions.length - rows.length };
};
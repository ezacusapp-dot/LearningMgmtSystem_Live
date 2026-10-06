

// modules/exams/exams.service.ts
import { prisma } from "@/lib/prisma";
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
  sanitizeExamForStudent,
} from "./exams.repository";
import { CreateExamDto, UpdateExamDto, ExamQueryParams } from "./exams.types";

export const getExamsService = async (query: ExamQueryParams) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  const [total, data] = await Promise.all([
    countExamsRepo(where),
    getExamsRepo(where, skip, limit),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
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

  if (data.passingMarks > data.totalMarks) {
    throw new Error("Passing marks cannot exceed total marks");
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
  if (newPassing > newTotal) {
    throw new Error("Passing marks cannot exceed total marks");
  }

  return updateExamRepo(id, data);
};

export const replaceExamSectionsService = async (
  id: string,
  sections: NonNullable<CreateExamDto["sections"]>
) => {
  const existing = await findExamByIdRepo(id);
  if (!existing) throw new Error("Exam not found");

  return replaceExamSectionsRepo(id, sections);
};

// Replace all questions on an exam (flat, no section grouping required)
export const replaceExamQuestionsService = async (
  examId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error("At least one question is required");
  }

  return replaceExamQuestionsRepo(examId, questions);
};

export const addQuestionToSectionService = async (
  examId: string,
  sectionId: string,
  question: NonNullable<CreateExamDto["questions"]>[0]
) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");

  // The repo already recomputes the exam's totalMarks after inserting.
  return addQuestionToSectionRepo(examId, sectionId, question);
};

export const bulkUpdateSectionQuestionsService = async (
  examId: string,
  sectionId: string,
  questions: NonNullable<CreateExamDto["questions"]>
) => {
  const exam = await findExamByIdRepo(examId);
  if (!exam) throw new Error("Exam not found");

  return bulkUpdateSectionQuestionsRepo(examId, sectionId, questions);
};

/**
 * Student-safe exam payload (no answers, no explanations).
 *
 * The date window is intentionally NOT enforced here: the instructions page
 * needs this data to show "opens on…" / "closed on…" notices. Enforce the
 * window where it matters — when an attempt starts and when it is submitted
 * (POST /api/exams/[id]/attempts).
 */
export const getExamForStudentService = async (id: string) => {
  const exam = await findExamByIdRepo(id);
  if (!exam) throw new Error("Exam not found");
  if (exam.status !== "Active") throw new Error("Exam is not active");

  return sanitizeExamForStudent(exam);
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
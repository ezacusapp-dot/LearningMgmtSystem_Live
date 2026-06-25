// modules/exams/exams.validation.ts
import { z } from "zod";

// ─── Shared schemas ────────────────────────────────────────────────────────────

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().default(""),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
  inputMode: z.enum(["text", "image"]).optional().default("text"),
  imageData: z.string().nullable().optional(),
});

const questionSchema = z.object({
  id: z.string().optional(),
  sectionId: z.string().nullable().optional(),
  question: z.string().min(1, "Question text is required"),
  inputMode: z.enum(["text", "image"]).optional().default("text"),
  questionImage: z.string().nullable().optional(),
  codeSnippet: z.string().nullable().optional(),
  codeLanguage: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  explanationImage: z.string().nullable().optional(),
  points: z.number().int().min(1).default(1),
  difficulty: z
    .enum(["Easy", "Medium", "Difficult", "Challenging"])
    .nullable()
    .optional(),
  bloomLevel: z
    .enum(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"])
    .nullable()
    .optional(),
  questionType: z
    .enum(["Conceptual", "Prediction", "Debugging", "ProblemSolving"])
    .nullable()
    .optional(),
  order: z.number().int().min(0),
  options: z
    .array(optionSchema)
    .min(2, "At least 2 options are required")
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: "At least one option must be marked correct",
    }),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title is required"),
  description: z.string().nullable().optional(),
  order: z.number().int().min(0),
  difficulty: z
    .enum(["Easy", "Medium", "Difficult", "Challenging"])
    .nullable()
    .optional(),
  questionType: z
    .enum(["Conceptual", "Prediction", "Debugging", "ProblemSolving"])
    .nullable()
    .optional(),
  totalMarks: z.number().int().min(0),
  passingMarks: z.number().int().min(0).nullable().optional(),
  timeLimit: z.number().int().min(0).nullable().optional(),
  questions: z.array(questionSchema).optional(),
});

// ─── Create exam ───────────────────────────────────────────────────────────────

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  courseId: z.string().nullable().optional(),
  examType: z.enum(["MOCK", "FINAL"]).optional().default("MOCK"),
  totalMarks: z.number().int().min(1, "Total marks must be at least 1"),
  passingMarks: z.number().int().min(0, "Passing marks must be non-negative"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  status: z.enum(["Active", "Inactive", "Draft", "Archived"]).optional().default("Draft"),
  maxAttempts: z.number().int().min(1).optional().default(3),
  showAnswers: z.boolean().optional().default(false),
  showExplanations: z.boolean().optional().default(false),
  randomizeQuestions: z.boolean().optional().default(false),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  createdBy: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
  questions: z.array(questionSchema).optional(),
});

// ─── Update exam ───────────────────────────────────────────────────────────────

const updateExamSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  courseId: z.string().nullable().optional(),
  examType: z.enum(["MOCK", "FINAL"]).optional(),
  totalMarks: z.number().int().min(1).optional(),
  passingMarks: z.number().int().min(0).optional(),
  duration: z.number().int().min(1).optional(),
  status: z.enum(["Active", "Inactive", "Draft", "Archived"]).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  showAnswers: z.boolean().optional(),
  showExplanations: z.boolean().optional(),
  randomizeQuestions: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  createdBy: z.string().optional(),
});

// ─── Replace all questions (flat, used by questions/page.tsx) ──────────────────

const replaceQuestionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

// ─── Add single question to section ───────────────────────────────────────────

const addQuestionToSectionSchema = z.object({
  sectionId: z.string().min(1, "Section ID is required"),
  question: questionSchema,
});

// ─── Bulk update questions grouped by section ─────────────────────────────────

const bulkUpdateQuestionsSchema = z.object({
  sections: z.array(
    z.object({
      sectionId: z.string().min(1),
      questions: z.array(questionSchema),
    })
  ),
});

// ─── Assign course ─────────────────────────────────────────────────────────────

const assignCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

// ─── Exported validators ───────────────────────────────────────────────────────

export const validateCreateExam = (body: unknown) => createExamSchema.parse(body);

export const validateUpdateExam = (body: unknown) => updateExamSchema.parse(body);

export const validateReplaceQuestions = (body: unknown) =>
  replaceQuestionsSchema.parse(body);

export const validateAddQuestionToSection = (body: unknown) =>
  addQuestionToSectionSchema.parse(body);

export const validateBulkUpdateQuestions = (body: unknown) =>
  bulkUpdateQuestionsSchema.parse(body);

export const validateAssignCourse = (body: unknown) => assignCourseSchema.parse(body);
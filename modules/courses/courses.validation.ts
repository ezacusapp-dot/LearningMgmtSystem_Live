import { z } from "zod";

const courseStatusEnum = z.enum(["Draft", "Published", "Archived"], {
  errorMap: () => ({ message: "Status must be Draft, Published, or Archived" }),
});

const optionSchema = z.object({
  text:      z.string(),
  isCorrect: z.boolean(),
  order:     z.number().int().min(1),
  inputMode: z.enum(["text", "image"]).optional().default("text"),
  imageData: z.string().optional().nullable(),
});

const questionSchema = z.object({
  text:         z.string(),
  points:       z.number().int().min(1).default(1),
  difficulty:   z.string().optional().nullable(),
  bloomLevel:   z.string().optional().nullable(),
  questionType: z.string().optional().nullable(),
  codeSnippet:  z.string().optional().nullable(),
  codeLanguage: z.string().optional().nullable(),
  explanation:  z.string().optional().nullable(),
  options:      z.array(optionSchema).min(2),
  inputMode:     z.enum(["text", "image"]).optional().default("text"),
  questionImage: z.string().optional().nullable(),
});

const lessonSchema = z.object({
  title:       z.string().min(1),
  contentType: z.enum(["VIDEO", "PDF", "DOCUMENT"]),
  fileUrl:     z.string().optional(),
  videoLinks:  z.array(z.string()).optional(),
  order:       z.number().int().min(1),
});

const moduleSchema = z.object({
  title:       z.string().min(1),
  type:        z.enum(["LESSON", "REVISION", "QUIZ", "FINAL_QUIZ"]),
  order:       z.number().int().min(1),
  description: z.string().optional(),
  lessons:     z.array(lessonSchema).optional(),
  questions:   z.array(questionSchema).optional(),
});

export const createCourseSchema = z
  .object({
    title:             z.string().min(1, "Title is required"),
    description:       z.string().optional(),
    categoryId:        z.string().optional(),
    levelId:           z.string().optional(),
    // ── Accept EITHER field name from the frontend ──────────────────────────
    durationTypeId:    z.string().optional(),
    validityPeriodId:  z.string().optional(),
    // ────────────────────────────────────────────────────────────────────────
    status:            courseStatusEnum.optional(),
    createdBy:         z.string().optional(),
    thumbnailUrl:      z.string().optional(),
    modules:           z.array(moduleSchema).optional(),
    schedule:          z.any().optional(),
    intermediateTests: z.any().optional(),
    eligibilityRules:  z.any().optional(),
    gradeIds:          z.array(z.string()).optional(),
    thumbnailName:     z.any().optional(),
    thumbnailFile:     z.any().optional(),
  })
  // Normalise: always output durationTypeId regardless of which field was sent
  .transform(({ durationTypeId, validityPeriodId, ...rest }) => ({
    ...rest,
    durationTypeId: durationTypeId ?? validityPeriodId ?? undefined,
  }));

export const updateCourseSchema = z
  .object({
    title:            z.string().min(1).optional(),
    description:      z.string().optional(),
    categoryId:       z.string().optional(),
    levelId:          z.string().optional(),
    durationTypeId:   z.string().optional(),
    validityPeriodId: z.string().optional(),
    status:           courseStatusEnum.optional(),
    createdBy:        z.string().optional(),
    thumbnailUrl:     z.string().optional(),
  })
  .transform(({ durationTypeId, validityPeriodId, ...rest }) => ({
    ...rest,
    durationTypeId: durationTypeId ?? validityPeriodId ?? undefined,
  }));

export const validateCreateCourse = (data: unknown) => createCourseSchema.parse(data);
export const validateUpdateCourse  = (data: unknown) => updateCourseSchema.parse(data);
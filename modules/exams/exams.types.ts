// modules/exams/exams.types.ts
export type ExamStatus = "Active" | "Inactive" | "Draft" | "Archived";
export type ExamType = "MOCK" | "FINAL";
export type ExamDifficulty = "Easy" | "Medium" | "Difficult" | "Challenging";
export type ExamQuestionType = "Conceptual" | "Prediction" | "Debugging" | "ProblemSolving";
export type ExamBloomLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";

export interface ExamOptionDto {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  inputMode?: "text" | "image";
  imageData?: string | null;
}

export interface ExamQuestionDto {
  id?: string;
  sectionId?: string | null;
  question: string;
  inputMode?: "text" | "image";
  questionImage?: string | null;
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  explanation?: string | null;
  explanationImage?: string | null;
  points: number;
  difficulty?: ExamDifficulty | null;
  bloomLevel?: ExamBloomLevel | null;
  questionType?: ExamQuestionType | null;
  order: number;
  options: ExamOptionDto[];
}

export interface ExamSectionDto {
  id?: string;
  title: string;
  description?: string | null;
  order: number;
  difficulty?: ExamDifficulty | null;
  questionType?: ExamQuestionType | null;
  questions?: ExamQuestionDto[];
}

export interface CreateExamDto {
  title: string;
  description?: string | null;
  courseId?: string | null;
  examType?: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status?: ExamStatus;
  maxAttempts?: number;
  showAnswers?: boolean;
  showExplanations?: boolean;
  randomizeQuestions?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdBy?: string;
  sections?: ExamSectionDto[];
  questions?: ExamQuestionDto[];
}

export interface UpdateExamDto {
  title?: string;
  description?: string | null;
  courseId?: string | null;
  examType?: ExamType;
  totalMarks?: number;
  passingMarks?: number;
  duration?: number;
  status?: ExamStatus;
  maxAttempts?: number;
  showAnswers?: boolean;
  showExplanations?: boolean;
  randomizeQuestions?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdBy?: string;
}

export interface ExamResponse {
  id: string;
  title: string;
  description?: string | null;
  courseId?: string | null;
  examType: ExamType;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status: ExamStatus;
  maxAttempts?: number | null;
  showAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    title: string;
  } | null;
  _count?: {
    questions: number;
    attempts: number;
  };
  sections?: ExamSectionDto[];
  questions?: ExamQuestionDto[];
}

export interface ExamQueryParams {
  page?: string | null;
  limit?: string | null;
  search?: string | null;
  status?: string | null;
  examType?: string | null;
  courseId?: string | null;
}
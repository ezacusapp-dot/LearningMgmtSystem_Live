import { CourseStatus } from "@prisma/client";

export interface OptionDto {
  text:       string;
  isCorrect:  boolean;
  order:      number;
  inputMode?: "text" | "image";
  imageData?: string | null;
}

export interface QuestionDto {
  text:          string;
  points:        number;
  difficulty?:   string;
  bloomLevel?:   string;
  questionType?: string;
  codeSnippet?:  string | null;
  codeLanguage?: string | null;
  explanation?:  string | null;
  options:       OptionDto[];
  inputMode?:    "text" | "image";
  questionImage?: string | null;
}

export interface LessonDto {
  title:       string;
  contentType: string;
  fileUrl?:    string;
  videoLinks?: string[];
  order:       number;
}

export interface ModuleDto {
  title:        string;
  type:         "LESSON" | "REVISION" | "QUIZ" | "FINAL_QUIZ";
  order:        number;
  description?: string;
  lessons?:     LessonDto[];
  questions?:   QuestionDto[];
}

export interface CreateCourseDto {
  title:           string;
  description?:    string;
  categoryId?:     string;
  levelId?:        string;
  /** Always normalised to this name after Zod transform — never validityPeriodId */
  durationTypeId?: string;
  status?:         CourseStatus;
  createdBy?:      string;
  thumbnailUrl?:   string;
  gradeIds?:       string[];
  modules?:        ModuleDto[];
}

export interface UpdateCourseDto {
  title?:          string;
  description?:    string;
  categoryId?:     string;
  levelId?:        string;
  durationTypeId?: string;
  status?:         CourseStatus;
  createdBy?:      string;
  thumbnailUrl?:   string;
}
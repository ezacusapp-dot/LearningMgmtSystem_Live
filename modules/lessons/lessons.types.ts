// export interface CreateLessonDto {
//   moduleId: string;
//   title: string;
//   contentType: string;
//   fileUrl?: string;
//   order?: number;
// }

// export interface UpdateLessonDto {
//   title?: string;
//   contentType?: string;
//   fileUrl?: string;
//   order?: number;
// }
// export interface CreateLessonDto {
//   moduleId: string;
//   title: string;
//   contentType: string;
//   fileUrl?: string;
//   order?: number;
//   isActive?: boolean;
// }

// export interface UpdateLessonDto {
//   title?: string;
//   contentType?: string;
//   fileUrl?: string;
//   order?: number;
//   isActive?: boolean;   // ← add this
// }
// ============================================================
// lessons.types.ts
// ============================================================

import { ContentType } from "@prisma/client";

export interface CreateLessonDto {
  moduleId:    string;
  title:       string;
  contentType: ContentType;
  /**
   * VIDEO    → first entry of videoLinks is stored here
   * PDF/DOC  → actual filename / path
   */
  fileUrl?:    string;
  videoLinks?: string[];   // frontend sends this for VIDEO type
  order?:      number;
  isActive?:   boolean;
}

export interface UpdateLessonDto {
  title?:       string;
  contentType?: ContentType;
  fileUrl?:     string | null;
  videoLinks?:  string[];
  order?:       number;
  isActive?:    boolean;
}

/** Shape returned to the client — adds videoLinks back from fileUrl for VIDEO */
export interface LessonResponse {
  id:          string;
  moduleId:    string;
  title:       string;
  contentType: ContentType;
  fileUrl:     string | null;
  videoLinks:  string[];
  order:       number;
  isActive:    boolean;
  createdAt:   Date;
  updatedAt:   Date;
  module?:     { id: string; title: string };
}
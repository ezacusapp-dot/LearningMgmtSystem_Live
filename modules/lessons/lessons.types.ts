export interface CreateLessonDto {
  moduleId: string;
  title: string;
  contentType: string;
  fileUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  contentType?: string;
  fileUrl?: string;
  order?: number;
  isActive?: boolean;
}
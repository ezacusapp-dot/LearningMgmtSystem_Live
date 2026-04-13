export interface CourseCategory {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  categoryLogo?: string | null;
  categoryBackground?: string | null;
  isDraft: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  levelId?: string | null;
  durationTypeId?: string | null;
}

export interface CreateCourseCategoryInput {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  categoryLogo?: string;
  categoryBackground?: string;
  isDraft?: boolean;
  levelId?: string;
  durationTypeId?: string;
}

export interface UpdateCourseCategoryInput extends Partial<CreateCourseCategoryInput> {}
export interface Grade {
  id: string;
  name: string;
  // minMarks?: number;
  // maxMarks?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateGradeDTO {
  name: string;
  // minMarks?: number;
  // maxMarks?: number;
  sortOrder?: number;
}

export interface UpdateGradeDTO {
  name?: string;
  // minMarks?: number;
  // maxMarks?: number;
  sortOrder?: number;
  isActive?: boolean;
}
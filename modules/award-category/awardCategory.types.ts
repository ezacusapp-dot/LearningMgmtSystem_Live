export interface AwardCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateAwardCategoryDTO {
  name: string;
  sortOrder?: number;
}

export interface UpdateAwardCategoryDTO {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}
export interface Level {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateLevelDTO {
  name: string;
  sortOrder?: number;
}

export interface UpdateLevelDTO {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface LevelQuery {
  page: number;
  limit: number;
  search?: string;
}
export interface DurationType {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateDurationTypeDTO {
  name: string;
  sortOrder?: number;
}

export interface UpdateDurationTypeDTO {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}
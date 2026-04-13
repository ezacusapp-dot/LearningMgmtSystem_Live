export interface ValidityPeriod {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateValidityPeriodDTO {
  name: string;
  sortOrder?: number;
}

export interface UpdateValidityPeriodDTO {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ValidityQuery {
  page: number;
  limit: number;
  search?: string;
}
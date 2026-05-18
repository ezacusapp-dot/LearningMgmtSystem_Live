export type DurationUnit = "Days" | "Weeks" | "Months" | "Years";

export interface DurationType {
  id: string;
  value: number;
  unit: DurationUnit;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateDurationTypeDTO {
  value: number;
  unit: DurationUnit;
  sortOrder?: number;
}

export interface UpdateDurationTypeDTO {
  value?: number;
  unit?: DurationUnit;
  sortOrder?: number;
  isActive?: boolean;
}
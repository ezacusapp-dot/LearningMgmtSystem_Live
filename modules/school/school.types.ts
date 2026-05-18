export type SubscriptionStatus = "active" | "trial" | "expired";
export type Region = "North" | "South" | "East" | "West" | "Central";
export type State =
  | "California"
  | "Washington"
  | "New York"
  | "Texas"
  | "Florida"
  | "Illinois";

export type UserRole = "SUPER_ADMIN" | "SCHOOL_ADMIN" | "STUDENT" | "PARENT";

export interface School {
  id: string;
  name: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  address: string;
  region: Region;
  state: State;
  students: number;
  active: boolean;
  subscription: SubscriptionStatus;
  performance: number;
  password: string;
  role: UserRole;              // ✅ ADD THIS
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolDTO {
  name: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  address: string;
  region: Region;
  state: State;
  students?: number;
  active?: boolean;
  subscription?: SubscriptionStatus;
  performance?: number;
  password: string;
  role?: UserRole;             // ✅ ADD THIS (optional, default in DB)
}

export interface UpdateSchoolDTO {
  name?: string;
  adminName?: string;
  adminEmail?: string;
  phone?: string;
  address?: string;
  region?: Region;
  state?: State;
  students?: number;
  active?: boolean;
  subscription?: SubscriptionStatus;
  performance?: number;
  password?: string;
  role?: UserRole;             // ✅ ADD THIS (optional)
}
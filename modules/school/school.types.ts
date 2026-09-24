export type SubscriptionStatus = "active" | "trial" | "expired";
export type Region = "North" | "South" | "East" | "West" | "Central";
export type State =
  | "Andhra Pradesh"
  | "Arunachal Pradesh"
  | "Assam"
  | "Bihar"
  | "Chhattisgarh"
  | "Goa"
  | "Gujarat"
  | "Haryana"
  | "Himachal Pradesh"
  | "Jharkhand"
  | "Karnataka"
  | "Kerala"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Manipur"
  | "Meghalaya"
  | "Mizoram"
  | "Nagaland"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Sikkim"
  | "Tamil Nadu"
  | "Telangana"
  | "Tripura"
  | "Uttar Pradesh"
  | "Uttarakhand"
  | "West Bengal"
  // Union Territories
  | "Andaman and Nicobar Islands"
  | "Chandigarh"
  | "Dadra and Nagar Haveli and Daman and Diu"
  | "Delhi"
  | "Jammu and Kashmir"
  | "Ladakh"
  | "Lakshadweep"
  | "Puducherry";

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
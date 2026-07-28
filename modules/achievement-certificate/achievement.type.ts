// ─────────────────────────────────────────────────────────────
// Types shared across repository / service / controller layers
// ─────────────────────────────────────────────────────────────

export interface AchievementCertificate {
  id: string;
  certificateName: string;
  designation: string;
  colorCode: string;
  percentFrom: number;
  percentTo: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape accepted when creating a new certificate band */
export type CreateAchievementCertificateInput = {
  certificateName: string;
  designation: string;
  colorCode: string;
  percentFrom: number;
  percentTo: number;
};

/** Shape accepted when updating an existing certificate band (partial) */
export type UpdateAchievementCertificateInput =
  Partial<CreateAchievementCertificateInput>;

/** Query params supported when listing certificates */
export interface ListAchievementCertificatesQuery {
  search?: string;
  sortBy?: "certificateName" | "percentFrom" | "percentTo" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Standard API envelope used by every controller response */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    fieldErrors?: Record<string, string>;
  };
}

export type ApiResponseBody<T> = ApiSuccess<T> | ApiError;

/** Thrown by the service layer; controller maps this to HTTP responses */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}

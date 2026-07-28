// modules/certificate-template/certificateTemplate.types.ts

export interface CertificateTemplate {
  id?: string;
  name: string;
  courseId: string;
  courseCode?: string;

  organizationName: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;

  logoUrl: string | null;
  signatureUrl: string | null;
  signature2Url: string | null;
  backgroundUrl: string | null;

  signatory1Name: string;
  signatory1Role: string;
  signatory2Name: string;
  signatory2Role: string;

  sealEnabled: boolean;
  qrPosition: 'bottom-right' | 'bottom-left' | 'top-right';

  includeRanking?: boolean;
  includeScore?: boolean;

  templateVersion?: number;
  isDraft?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Relation
  course?: Course;
}

export interface Course {
  id: string;
  title: string;
  isActive?: boolean;
}

export interface CertificateTemplateListQuery {
  courseId?: string;
  isDraft?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
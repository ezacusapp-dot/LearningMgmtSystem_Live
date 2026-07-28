// types/certificate.ts
export type CertificateKind = "course" | "exam";

export interface UnifiedCertificate {
  id: string;
  kind: CertificateKind;
  certificateNumber: string;
  title: string;          // course title OR exam title
  issueDate: string;
  grade: string;           // course finalGrade OR exam band certificateName
  percentage?: number;
  colorCode?: string;      // exam certs only — drives the themed Certificate component
  studentName: string;
  instructor?: string;     // course certs only
  downloadUrl?: string;    // already-rendered PDF, if any
}
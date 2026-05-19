import { verifyToken } from "@/lib/paseto";
import { NextRequest } from "next/server";

export interface StudentTokenPayload {
  id: number;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  studentEmail: string | null;
  studentMobile: string | null;
  parentMobile: string;
  parentEmail: string | null;
  standard: string;
  batch: string | null;
  schoolYear: string;
  address: string | null;
  status: string;
  role: string;
  createdAt: string;
}

export async function getStudentFromToken(request: NextRequest): Promise<StudentTokenPayload | null> {
  try {
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token) as StudentTokenPayload;
    
    // Verify that the role is STUDENT
    if (payload.role !== "STUDENT") {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error extracting student from token:", error);
    return null;
  }
}

// Helper to get student ID from token quickly
export async function getStudentIdFromToken(request: NextRequest): Promise<number | null> {
  const student = await getStudentFromToken(request);
  return student?.id || null;
}
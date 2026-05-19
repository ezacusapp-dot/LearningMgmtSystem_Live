import { NextRequest, NextResponse } from "next/server";
import { getStudentFromToken } from "@/lib/auth/student-auth";

export async function GET(request: NextRequest) {
  try {
    const student = await getStudentFromToken(request);
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Error fetching current student:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
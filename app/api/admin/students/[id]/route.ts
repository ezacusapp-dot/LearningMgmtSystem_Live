import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminIdFromSession } from "@/lib/auth";
import {
  updateStudentService,
  deleteStudentService,
} from "@/modules/students/students.service";
import { validateUpdateStudent } from "@/modules/students/students.validation";

const fail = (err: any) => {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: err.issues[0]?.message ?? "Invalid input",
        errors: err.issues,
      },
      { status: 400 }
    );
  }
  const msg: string = err?.message || "Something went wrong";
  const status = /unauthorized/i.test(msg)
    ? 401
    : /not found/i.test(msg)
    ? 404
    : /already exists|required|inactive|does not exist/i.test(msg)
    ? 400
    : 500;
  return NextResponse.json({ success: false, message: msg }, { status });
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await getAdminIdFromSession(req);
    if (!adminId) throw new Error("Unauthorized");

    const { id } = await params;
    if (!id) throw new Error("Student ID is required");

    const body = await req.json();
    const data = validateUpdateStudent(body);

    const result = await updateStudentService(id, data, null);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student Updated Successfully",
    });
  } catch (err: any) {
    return fail(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await getAdminIdFromSession(req);
    if (!adminId) throw new Error("Unauthorized");

    const { id } = await params;
    await deleteStudentService(id, null);

    return NextResponse.json({
      success: true,
      message: "Student Deleted Successfully",
    });
  } catch (err: any) {
    return fail(err);
  }
}
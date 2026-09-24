import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminIdFromSession } from "@/lib/auth";
import {
  getStudentService,
  createStudentService,
} from "@/modules/students/students.service";
import { validateCreateStudent } from "@/modules/students/students.validation";

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

export async function GET(req: NextRequest) {
  try {
    const adminId = await getAdminIdFromSession(req);
    if (!adminId) throw new Error("Unauthorized");

    const { searchParams } = new URL(req.url);
    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
      standard: searchParams.get("grade") || "",
      batch: searchParams.get("batch") || "",
      schoolId: searchParams.get("schoolId") || "",
    };

    const result = await getStudentService(query);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await getAdminIdFromSession(req);
    if (!adminId) throw new Error("Unauthorized");

    const body = await req.json();

    // Unlike the school route, admin MUST supply a real schoolId — there's
    // no session-derived school to fall back to.
    if (!body.schoolId) {
      throw new Error("schoolId is required when creating a student as admin");
    }

    const data = validateCreateStudent(body);
    const result = await createStudentService(data);

    return NextResponse.json(
      { success: true, data: result, message: "Student Added Successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    return fail(err);
  }
}
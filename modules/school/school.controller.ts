import { NextResponse } from "next/server";
import {
  createSchoolService,
  getSchoolsService,
  getSchoolByIdService,
  updateSchoolService,
  deleteSchoolService,
  loginSchoolService,
} from "./school.service";
import { validateCreateSchool, validateUpdateSchool, validateLogin } from "./school.validation";

// CREATE
export const createSchoolController = async (req: Request) => {
  try {
    const body = await req.json();
    const data = validateCreateSchool(body); // now includes password
    const result = await createSchoolService(data); // hashes and excludes password
    return NextResponse.json(
      { success: true, data: result, message: "School Created Successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// GET ALL (password already excluded in service)
export const getSchoolsController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const activeParam = searchParams.get("active");
    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
      region: searchParams.get("region") || undefined,
      state: searchParams.get("state") || undefined,
      subscription: searchParams.get("subscription") || undefined,
      active: activeParam === "true" ? true : activeParam === "false" ? false : undefined,
    };
    const result = await getSchoolsService(query); // result.data already without password
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
};

// GET BY ID
export const getSchoolByIdController = async (id: string) => {
  try {
    const result = await getSchoolByIdService(id); // already without password
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 404 });
  }
};

// UPDATE
export const updateSchoolController = async (req: Request, id: string) => {
  try {
    const body = await req.json();
    const data = validateUpdateSchool(body); // password optional
    const result = await updateSchoolService(id, data); // hashes if needed, excludes password
    return NextResponse.json({
      success: true,
      data: result,
      message: "School Updated Successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
};

// DELETE
export const deleteSchoolController = async (id: string) => {
  try {
    await deleteSchoolService(id);
    return NextResponse.json({ success: true, message: "School Deleted Successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
};

// ✅ LOGIN CONTROLLER
export const loginSchoolController = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, password } = validateLogin(body);
    const school = await loginSchoolService(email, password);
    // You may want to issue a JWT or session token here
    return NextResponse.json({
      success: true,
      data: school,
      message: "Login successful",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 401 }
    );
  }
};
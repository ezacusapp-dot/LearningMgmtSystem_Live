

// import { NextResponse } from "next/server";
// import {createStudentService,getStudentService,updateStudentService,deleteStudentService,} from "./students.service";

// import { validateCreateStudent, validateUpdateStudent,} from "./students.validation";

// // CREATE
// export const createStudentController = async (req: Request) => {
//   try {
//     const body = await req.json();
//     const data = validateCreateStudent(body);

//     const result = await createStudentService(data);

//     return NextResponse.json({
//       success: true,
//       data: result,
//       message: "Student Added Successfully",
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// };

// // GET
// export const getStudentController = async (req: Request) => {
//   try {
//     const { searchParams } = new URL(req.url);

//     const query = {
//       page: Number(searchParams.get("page") || 1),
//       limit: Number(searchParams.get("limit") || 10),
//       search: searchParams.get("search") || "",
//       standard: searchParams.get("grade") || "",  // ✅ Map 'grade' query param to 'standard'
//       batch: searchParams.get("batch") || "",
//     };

//     const result = await getStudentService(query);

//     return NextResponse.json({
//       success: true,
//       ...result,
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// };

// // UPDATE
// export const updateStudentController = async (req: Request, id: string) => {
//   try {
//     if (!id) {
//       throw new Error("Student ID is required");
//     }

//     const body = await req.json();
//     const data = validateUpdateStudent(body);

//     const result = await updateStudentService(id, data);

//     return NextResponse.json({
//       success: true,
//       data: result,
//       message: "Student Updated Successfully",
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// };

// // DELETE
// export const deleteStudentController = async (id: string) => {
//   try {
//     await deleteStudentService(id);

//     return NextResponse.json({
//       success: true,
//       message: "Student Deleted Successfully",
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500 }
//     );
//   }
// };

// import { NextResponse } from "next/server";
// import { ZodError } from "zod";
// import {
//   createStudentService,
//   getStudentService,
//   updateStudentService,
//   deleteStudentService,
// } from "./students.service";

// import {
//   validateCreateStudent,
//   validateUpdateStudent,
// } from "./students.validation";

// // Maps errors to proper HTTP status codes
// const fail = (err: any) => {
//   if (err instanceof ZodError) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: err.issues[0]?.message ?? "Invalid input",
//         errors: err.issues,
//       },
//       { status: 400 }
//     );
//   }

//   const msg: string = err?.message || "Something went wrong";
//   const status = /not found/i.test(msg)
//     ? 404
//     : /already exists|required|inactive|does not exist/i.test(msg)
//     ? 400
//     : 500;

//   return NextResponse.json({ success: false, message: msg }, { status });
// };

// // CREATE
// export const createStudentController = async (req: Request) => {
//   try {
//     const body = await req.json();
//     const data = validateCreateStudent(body);

//     const result = await createStudentService(data);

//     return NextResponse.json(
//       {
//         success: true,
//         data: result,
//         message: "Student Added Successfully",
//       },
//       { status: 201 }
//     );
//   } catch (err: any) {
//     return fail(err);
//   }
// };

// // GET
// export const getStudentController = async (req: Request) => {
//   try {
//     const { searchParams } = new URL(req.url);

//     const query = {
//       page: Number(searchParams.get("page") || 1),
//       limit: Number(searchParams.get("limit") || 10),
//       search: searchParams.get("search") || "",
//       standard: searchParams.get("grade") || "", // 'grade' query param -> 'standard'
//       batch: searchParams.get("batch") || "",
//       schoolId: searchParams.get("schoolId") || "",
//     };

//     const result = await getStudentService(query);

//     return NextResponse.json({
//       success: true,
//       ...result,
//     });
//   } catch (err: any) {
//     return fail(err);
//   }
// };

// // UPDATE
// export const updateStudentController = async (req: Request, id: string) => {
//   try {
//     if (!id) {
//       throw new Error("Student ID is required");
//     }

//     const body = await req.json();
//     const data = validateUpdateStudent(body);

//     const result = await updateStudentService(id, data);

//     return NextResponse.json({
//       success: true,
//       data: result,
//       message: "Student Updated Successfully",
//     });
//   } catch (err: any) {
//     return fail(err);
//   }
// };

// // DELETE
// export const deleteStudentController = async (id: string) => {
//   try {
//     await deleteStudentService(id);

//     return NextResponse.json({
//       success: true,
//       message: "Student Deleted Successfully",
//     });
//   } catch (err: any) {
//     return fail(err);
//   }
// };

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSchoolIdFromSession } from "@/lib/auth";
import {
  createStudentService,
  getStudentService,
  updateStudentService,
  deleteStudentService,
} from "./students.service";

import {
  validateCreateStudent,
  validateUpdateStudent,
} from "./students.validation";

// Maps errors to proper HTTP status codes
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

// CREATE
export const createStudentController = async (req: NextRequest) => {
  try {
    const schoolId = await getSchoolIdFromSession(req);
    if (!schoolId) throw new Error("Unauthorized: missing or invalid session");

    const body = await req.json();
    const { schoolId: _ignoreClientValue, ...rest } = body; // never trust a client-sent schoolId
    const data = validateCreateStudent({ ...rest, schoolId });

    const result = await createStudentService(data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "Student Added Successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return fail(err);
  }
};

// GET
// export const getStudentController = async (req: NextRequest) => {
//   try {
//     const schoolId = await getSchoolIdFromSession(req);
//     if (!schoolId) throw new Error("Unauthorized: missing or invalid session");

//     const { searchParams } = new URL(req.url);

//     const query = {
//       page: Number(searchParams.get("page") || 1),
//       limit: Number(searchParams.get("limit") || 10),
//       search: searchParams.get("search") || "",
//       standard: searchParams.get("grade") || "", // 'grade' query param -> 'standard'
//       batch: searchParams.get("batch") || "",
//       schoolId, // always the caller's own school — never from the URL
//     };

//     const result = await getStudentService(query);

//     return NextResponse.json({
//       success: true,
//       ...result,
//     });
//   } catch (err: any) {
//     return fail(err);
//   }
// };
export const getStudentController = async (req: NextRequest) => {
  try {
    const schoolId = await getSchoolIdFromSession(req);
    if (!schoolId) throw new Error("Unauthorized: missing or invalid session");

    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
      standard: searchParams.get("grade") || "",
      batch: searchParams.get("batch") || "",
      schoolId,
    };

    const result = await getStudentService(query);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return fail(err);
  }
};

// UPDATE
export const updateStudentController = async (req: NextRequest, id: string) => {
  try {
    const schoolId = await getSchoolIdFromSession(req);
    if (!schoolId) throw new Error("Unauthorized: missing or invalid session");

    if (!id) {
      throw new Error("Student ID is required");
    }

    const body = await req.json();
    const { schoolId: _ignoreClientValue, ...rest } = body; // school can't be reassigned via this endpoint
    const data = validateUpdateStudent(rest);

    const result = await updateStudentService(id, data, schoolId);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student Updated Successfully",
    });
  } catch (err: any) {
    return fail(err);
  }
};

// DELETE
export const deleteStudentController = async (req: NextRequest, id: string) => {
  try {
    const schoolId = await getSchoolIdFromSession(req);
    if (!schoolId) throw new Error("Unauthorized: missing or invalid session");

    await deleteStudentService(id, schoolId);

    return NextResponse.json({
      success: true,
      message: "Student Deleted Successfully",
    });
  } catch (err: any) {
    return fail(err);
  }
};
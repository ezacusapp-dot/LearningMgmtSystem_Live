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
//       grade: searchParams.get("grade") || "",
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

import { NextResponse } from "next/server";
import {createStudentService,getStudentService,updateStudentService,deleteStudentService,} from "./students.service";

import { validateCreateStudent, validateUpdateStudent,} from "./students.validation";

// CREATE
export const createStudentController = async (req: Request) => {
  try {
    const body = await req.json();
    const data = validateCreateStudent(body);

    const result = await createStudentService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student Added Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// GET
export const getStudentController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
      standard: searchParams.get("grade") || "",  // ✅ Map 'grade' query param to 'standard'
      batch: searchParams.get("batch") || "",
    };

    const result = await getStudentService(query);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// UPDATE
export const updateStudentController = async (req: Request, id: string) => {
  try {
    if (!id) {
      throw new Error("Student ID is required");
    }

    const body = await req.json();
    const data = validateUpdateStudent(body);

    const result = await updateStudentService(id, data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Student Updated Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// DELETE
export const deleteStudentController = async (id: string) => {
  try {
    await deleteStudentService(id);

    return NextResponse.json({
      success: true,
      message: "Student Deleted Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};
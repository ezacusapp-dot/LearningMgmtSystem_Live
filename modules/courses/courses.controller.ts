
// import {
//   getCoursesService,
//   getCourseByIdService,
//   createCourseService,
//   updateCourseService,
//   deleteCourseService,
// } from "./courses.service";
// import { validateCreateCourse, validateUpdateCourse } from "./courses.validation";

// // ================= GET ALL COURSES =================
// export const getCoursesController = async (req: Request) => {
//   try {
//     const { searchParams } = new URL(req.url);

//     const query = {
//       page:       searchParams.get("page"),
//       limit:      searchParams.get("limit"),
//       search:     searchParams.get("search"),
//       status:     searchParams.get("status"),
//       categoryId: searchParams.get("categoryId"),
//       levelId:    searchParams.get("levelId"),
//     };

//     const result = await getCoursesService(query);

//     return Response.json({ status: true, ...result });
//   } catch (err: any) {
//     return Response.json({ status: false, message: err.message }, { status: 500 });
//   }
// };

// // ================= GET COURSE BY ID =================
// export const getCourseByIdController = async (id: string) => {
//   try {
//     const data = await getCourseByIdService(id);
//     return Response.json({ status: true, data });
//   } catch (err: any) {
//     const status = err.message === "Course not found" ? 404 : 500;
//     return Response.json({ status: false, message: err.message }, { status });
//   }
// };

// // ================= CREATE COURSE =================
// export const createCourseController = async (req: Request) => {
//   try {
//     const body      = await req.json();
//     const validated = validateCreateCourse(body);
//     const data      = await createCourseService(validated);
//     return Response.json(
//       { status: true, message: "Course Created Successfully", data },
//       { status: 201 }
//     );
//   } catch (err: any) {
//     console.error("createCourse error →", err); // ← add this
//     return Response.json({ status: false, message: err.message }, { status: 400 });
//   }
// };
// // ================= UPDATE COURSE =================
// export const updateCourseController = async (req: Request, id: string) => {
//   try {
//     if (!id)
//       return Response.json({ status: false, message: "Course ID is required" }, { status: 400 });

//     const body      = await req.json();
//     const validated = validateUpdateCourse(body);
//     const data      = await updateCourseService(id, validated);

//     return Response.json({ status: true, message: "Course Updated Successfully", data });
//   } catch (err: any) {
//     const status = err.message === "Course not found" ? 404 : 400;
//     return Response.json({ status: false, message: err.message }, { status });
//   }
// };

// // ================= DELETE COURSE =================
// export const deleteCourseController = async (id: string) => {
//   try {
//     if (!id)
//       return Response.json({ status: false, message: "Course ID is required" }, { status: 400 });

//     await deleteCourseService(id);
//     return Response.json({ status: true, message: "Course Deleted Successfully" });
//   } catch (err: any) {
//     const status = err.message === "Course not found" ? 404 : 500;
//     return Response.json({ status: false, message: err.message }, { status });
//   }
// };
import {
  getCoursesService,
  getCourseByIdService,
  getCourseForEditService,
  createCourseService,
  updateCourseService,
  updateCourseFullService,
  deleteCourseService,
  getCoursesByGradeWithFullDetailsService,
} from "./courses.service";
import { validateCreateCourse, validateUpdateCourse } from "./courses.validation";

// ─── GET ALL ──────────────────────────────────────────────────────────────────

export const getCoursesController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = {
      page:       searchParams.get("page"),
      limit:      searchParams.get("limit"),
      search:     searchParams.get("search"),
      status:     searchParams.get("status"),
      categoryId: searchParams.get("categoryId"),
      levelId:    searchParams.get("levelId"),
    };
    const result = await getCoursesService(query);
    return Response.json({ status: true, ...result });
  } catch (err: any) {
    return Response.json({ status: false, message: err.message }, { status: 500 });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getCourseByIdController = async (id: string) => {
  try {
    const data = await getCourseByIdService(id);
    return Response.json({ status: true, data });
  } catch (err: any) {
    const status = err.message === "Course not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

/** Full course fetch for the edit form — includes all nested data */
export const getCourseForEditController = async (id: string) => {
  try {
    const data = await getCourseForEditService(id);
    return Response.json({ status: true, data });
  } catch (err: any) {
    const status = err.message === "Course not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createCourseController = async (req: Request) => {
  try {
    const body      = await req.json();
    const validated = validateCreateCourse(body);
    const data      = await createCourseService(validated);
    return Response.json(
      { status: true, message: "Course Created Successfully", data },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("createCourse error →", err);
    return Response.json({ status: false, message: err.message }, { status: 400 });
  }
};

// ─── UPDATE — full replacement (used by edit page) ────────────────────────────

export const updateCourseController = async (req: Request, id: string) => {
  try {
    if (!id)
      return Response.json(
        { status: false, message: "Course ID is required" },
        { status: 400 }
      );

    const body      = await req.json();
    const validated = validateCreateCourse(body); // reuse create schema — same shape
    const data      = await updateCourseFullService(id, validated as any);

    return Response.json({ status: true, message: "Course Updated Successfully", data });
  } catch (err: any) {
    console.error("updateCourse error →", err);
    const status = err.message === "Course not found" ? 404 : 400;
    return Response.json({ status: false, message: err.message }, { status });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteCourseController = async (id: string) => {
  try {
    if (!id)
      return Response.json(
        { status: false, message: "Course ID is required" },
        { status: 400 }
      );
    await deleteCourseService(id);
    return Response.json({ status: true, message: "Course Deleted Successfully" });
  } catch (err: any) {
    const status = err.message === "Course not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};
// In courses.controller.ts - add this function

// In courses.controller.ts

export const getCoursesByGradeWithFullDetailsController = async (gradeId: string, req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = {
      page:       searchParams.get("page"),
      limit:      searchParams.get("limit"),
      search:     searchParams.get("search"),
      status:     searchParams.get("status"),
      categoryId: searchParams.get("categoryId"),
      levelId:    searchParams.get("levelId"),
    };
    
    const result = await getCoursesByGradeWithFullDetailsService(gradeId, query);
    return Response.json({ status: true, ...result });
  } catch (err: any) {
    const status = err.message === "Grade not found" ? 404 : 500;
    return Response.json({ status: false, message: err.message }, { status });
  }
};
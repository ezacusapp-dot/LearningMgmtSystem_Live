import {NextResponse} from "next/server";
import {createCourseService,getCoursesService,updateCourseService,deleteCourseService} from "./courses.service";
import {validateCreateCourse,} from "./courses.validation";


// ================= CREATE =================
export const createCourseController = async (req: Request) => {
  try {
    const body = await req.json();

    // ✅ validation
    const data = validateCreateCourse(body);

    const course = await createCourseService(data);

    return NextResponse.json({
      status: true,
      message: "Course Created Successfully",
      data: course,
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
};


// ================= GET =================
export const getCoursesController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId") || "",
      levelId: searchParams.get("levelId") || "",
    };

    const result = await getCoursesService(query);

    return NextResponse.json({
      status: true,
      ...result,
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
};

// ================= PUT =================
export const updateCourseController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();

    const data = await updateCourseService(id, body);

    return Response.json({
      status: true,
      message: "Course Updated Successfully.",
      data,
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};

// ================= DELETE =================
export const deleteCourseController = async (id: string) => {
  try {
    await deleteCourseService(id);

    return Response.json({
      status: true,
      message: "Course Deleted Successfully.",
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};
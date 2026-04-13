import {createLessonService,getLessonsService,updateLessonService,deleteLessonService,} from "./lessons.service";

import { validateCreateLesson, validateUpdateLesson,} from "./lessons.validation";

// ================= CREATE =================
export const createLessonController = async (req: Request) => {
  try {
    const body = await req.json();
    const validated = validateCreateLesson(body);

    const data = await createLessonService(validated);

    return Response.json({status: true,message: "Lesson Added Successfully",data,});
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 400 }
    );
  }
};

// ================= GET =================
export const getLessonsController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page")),
      limit: Number(searchParams.get("limit")),
      search: searchParams.get("search"),
      moduleId: searchParams.get("moduleId"),
      contentType: searchParams.get("contentType"),
    };

    const data = await getLessonsService(query);

    return Response.json({
      status: true,
      ...data,
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};

// ================= UPDATE =================
export const updateLessonController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();
    const validated = validateUpdateLesson(body);

    const data = await updateLessonService(id, validated);

    return Response.json({
      status: true,
      message: "Lesson Updated Successfully",
      data,
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 400 }
    );
  }
};

// ================= DELETE =================
export const deleteLessonController = async (id: string) => {
  try {
    await deleteLessonService(id);

    return Response.json({
      status: true,
      message: "Lesson Deleted Successfully",
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};
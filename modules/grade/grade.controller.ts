import { NextResponse } from "next/server";
import {
  createGradeService,
  getGradeService,
  updateGradeService,
  deleteGradeService,
} from "./grade.service";

import {
  validateCreateGrade,
  validateUpdateGrade,
} from "./grade.validation";

// CREATE
export const createGradeController = async (req: Request) => {
  try {
    const body = await req.json();
    const data = validateCreateGrade(body);

    const result = await createGradeService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Grade Added Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// GET
export const getGradeController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getGradeService(query);

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
export const updateGradeController = async (req: Request, id: string) => {
  try {
    const body = await req.json();
    const data = validateUpdateGrade(body);

    const result = await updateGradeService(id, data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Grade Updated Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// DELETE
export const deleteGradeController = async (id: string) => {
  try {
    await deleteGradeService(id);

    return NextResponse.json({
      success: true,
      message: "Grade Deleted Successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};
import { NextResponse } from "next/server";
import {
  createLevelService,
  getLevelsService,
  updateLevelService,
  deleteLevelService,
} from "./level.service";

import {
  validateCreateLevel,
  validateUpdateLevel,
} from "./level.validation";


// CREATE
export const createLevelController = async (req: Request) => {
  try {
    const body = await req.json();

    const data = validateCreateLevel(body);

    const result = await createLevelService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Course level created successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};


// GET
export const getLevelsController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getLevelsService(query);

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
export const updateLevelController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();

    const data = validateUpdateLevel(body);

    const result = await updateLevelService(id, data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Updated successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};


// DELETE
export const deleteLevelController = async (id: string) => {
  try {
    await deleteLevelService(id);

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};
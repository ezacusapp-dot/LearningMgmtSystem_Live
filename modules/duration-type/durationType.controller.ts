import { NextResponse } from "next/server";
import {
  createDurationTypeService,
  getDurationTypeService,
  updateDurationTypeService,
  deleteDurationTypeService,
} from "./durationType.service";

import {
  validateCreateDurationType,
  validateUpdateDurationType,
} from "./durationType.validation";


// CREATE
export const createDurationTypeController = async (req: Request) => {
  try {
    const body = await req.json();

    const data = validateCreateDurationType(body);

    const result = await createDurationTypeService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Added Successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};


// GET
export const getDurationTypeController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getDurationTypeService(query);

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
export const updateDurationTypeController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();

    const data = validateUpdateDurationType(body);

    const result = await updateDurationTypeService(id, data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Updated Successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};


// DELETE
export const deleteDurationTypeController = async (id: string) => {
  try {
    await deleteDurationTypeService(id);

    return NextResponse.json({
      success: true,
      message: "Deleted Successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};
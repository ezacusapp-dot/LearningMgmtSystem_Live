import { NextResponse } from "next/server";
import {
  createValidityService,
  getValidityService,
  updateValidityService,
  deleteValidityService,
} from "./validityPeriod.service";

import {
  validateCreateValidity,
  validateUpdateValidity,
} from "./validityPeriod.validation";

// CREATE
export const createValidityController = async (req: Request) => {
  try {
    const body = await req.json();
    const data = validateCreateValidity(body);

    const result = await createValidityService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Created successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};

// GET
export const getValidityController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getValidityService(query);

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
export const updateValidityController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();
    const data = validateUpdateValidity(body);

    const result = await updateValidityService(id, data);

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
export const deleteValidityController = async (id: string) => {
  try {
    await deleteValidityService(id);

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
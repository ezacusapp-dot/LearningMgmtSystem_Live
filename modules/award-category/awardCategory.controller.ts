import { NextResponse } from "next/server";
import {createAwardCategoryService,getAwardCategoryService,updateAwardCategoryService,deleteAwardCategoryService,} from "./awardCategory.service";

import {validateCreateAwardCategory,validateUpdateAwardCategory,} from "./awardCategory.validation";


// CREATE
export const createAwardCategoryController = async (req: Request) => {
  try {
    const body = await req.json();

    const data = validateCreateAwardCategory(body);

    const result = await createAwardCategoryService(data);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Award Category Added Successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
};


// GET
export const getAwardCategoryController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getAwardCategoryService(query);

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
export const updateAwardCategoryController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();

    const data = validateUpdateAwardCategory(body);

    const result = await updateAwardCategoryService(id, data);

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
export const deleteAwardCategoryController = async (id: string) => {
  try {
    await deleteAwardCategoryService(id);

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
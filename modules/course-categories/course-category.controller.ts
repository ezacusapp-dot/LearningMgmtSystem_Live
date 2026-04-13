import { NextResponse } from "next/server";
import {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "./course-category.service";
import { validateCreateCategory } from "./course-category.validations";

// ================= CREATE =================
export const createCategoryController = async (req: Request) => {
  try {
    const body = await req.json();

    const data = validateCreateCategory(body);

    const category = await createCategoryService(data);

    return NextResponse.json({
      status: true,
      message: "Category Created Successfully",
      data: category,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};

// ================= GET =================
export const getCategoriesController = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      search: searchParams.get("search") || "",
    };

    const result = await getCategoriesService(query);

    return NextResponse.json({
      status: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};

// ================= UPDATE =================
export const updateCategoryController = async (
  req: Request,
  id: string
) => {
  try {
    const body = await req.json();

    const data = await updateCategoryService(id, body);

    return Response.json({
      status: true,
      message: "Category Updated Successfully",
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
export const deleteCategoryController = async (id: string) => {
  try {
    await deleteCategoryService(id);

    return Response.json({
      status: true,
      message: "Category Deleted Successfully",
    });
  } catch (err: any) {
    return Response.json(
      { status: false, message: err.message },
      { status: 500 }
    );
  }
};
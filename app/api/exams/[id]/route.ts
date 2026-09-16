// import { NextRequest } from "next/server";
// import {
//   getExamByIdController,
//   updateExamController,
//   deleteExamController,
// } from "modules/exams/exams.controller";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;  // ← Await params
//   return getExamByIdController(id);
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;  // ← Await params
//   return updateExamController(req, id);
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;  // ← Await params
//   return deleteExamController(id);
// }

import { NextRequest } from "next/server";
import {
  getExamByIdController,
  updateExamController,
  deleteExamController,
} from "modules/exams/exams.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await getExamByIdController(id);
  } catch (error) {
    console.error("Error in GET exam route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await updateExamController(req, id);
  } catch (error) {
    console.error("Error in PUT exam route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await deleteExamController(id);
  } catch (error) {
    console.error("Error in DELETE exam route:", error);
    return Response.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
// import {
//   updateModuleController,
//   deleteModuleController,
// } from "@/modules/modules/modules.controller";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateModuleController(req, params.id);
// }

// export async function DELETE(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteModuleController(params.id);
// }
// app/api/modules/[id]/route.ts

import {
  updateModuleController,
  deleteModuleController,
} from "@/modules/modules/modules.controller";
export const dynamic = "force-dynamic";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateModuleController(req, id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteModuleController(id);
}
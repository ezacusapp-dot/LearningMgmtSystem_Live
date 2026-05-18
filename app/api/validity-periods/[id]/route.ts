// import {updateValidityController,deleteValidityController,} from "@/modules/validity-period/validityPeriod.controller";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return updateValidityController(req, params.id);
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   return deleteValidityController(params.id);
// }
// app/api/validity-period/[id]/route.ts
import { updateValidityController, deleteValidityController } from "@/modules/validity-period/validityPeriod.controller";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateValidityController(req, id);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteValidityController(id);
}
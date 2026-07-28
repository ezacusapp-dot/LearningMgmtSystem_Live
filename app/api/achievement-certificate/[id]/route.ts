import { NextRequest } from "next/server";
import { achievementCertificateController as controller } from "modules/achievement-certificate/achievement.controller";

// GET    /api/achievement-certificate/:id   -> get one
// PATCH  /api/achievement-certificate/:id   -> partial update
// DELETE /api/achievement-certificate/:id   -> delete

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return controller.remove(req, id);
}
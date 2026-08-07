import { NextRequest } from "next/server";
import { certificateTemplateController } from "modules/certificate-template/certificateTemplate.controller";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  return certificateTemplateController.getById(id);
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  return certificateTemplateController.update(req, id);
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  return certificateTemplateController.remove(id);
}
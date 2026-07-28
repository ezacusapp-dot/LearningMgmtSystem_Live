// app/api/certificate-templates/[id]/route.ts

import { NextRequest } from 'next/server';
import { certificateTemplateController } from 'modules/certificate-template/certificateTemplate.controller';

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  return certificateTemplateController.getById(params.id);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return certificateTemplateController.update(req, params.id);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  return certificateTemplateController.remove(params.id);
}
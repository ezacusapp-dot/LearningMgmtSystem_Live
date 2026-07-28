// app/api/certificate-templates/route.ts

import { NextRequest } from 'next/server';
import { certificateTemplateController } from 'modules/certificate-template/certificateTemplate.controller';

export async function GET(req: NextRequest) {
  return certificateTemplateController.list(req);
}

export async function POST(req: NextRequest) {
  return certificateTemplateController.create(req);
}
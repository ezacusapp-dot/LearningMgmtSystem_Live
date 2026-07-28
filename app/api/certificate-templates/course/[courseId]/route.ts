// app/api/certificate-templates/course/[courseId]/route.ts

import { NextRequest } from 'next/server';
import { certificateTemplateController } from 'modules/certificate-template/certificateTemplate.controller';

interface RouteParams {
  params: { courseId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  return certificateTemplateController.getByCourse(params.courseId);
}
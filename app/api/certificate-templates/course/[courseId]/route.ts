import { NextRequest } from "next/server";
import { certificateTemplateController } from "modules/certificate-template/certificateTemplate.controller";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  const { courseId } = await params;
  return certificateTemplateController.getByCourse(courseId);
}
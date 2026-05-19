import { NextRequest } from "next/server";

import {
  updateRevisionContentController,
  deleteRevisionContentController,
} from "@/modules/revisions/revisions.controller";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await context.params;

  return updateRevisionContentController(req, contentId);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await context.params;

  return deleteRevisionContentController(contentId);
}
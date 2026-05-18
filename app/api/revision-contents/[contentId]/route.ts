// ============================================================
// app/api/revisions/[id]/contents/route.ts
// ============================================================
// POST → add a single content item to a revision

import { addRevisionContentController } from "@/modules/revisions/revisions.controller";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return addRevisionContentController(req, id);
}


// ============================================================
// app/api/revision-contents/[contentId]/route.ts
// ============================================================
// PUT  → update a specific content item
// DELETE → delete a specific content item

// (create this as a separate file at the path above)

import {
  updateRevisionContentController,
  deleteRevisionContentController,
} from "@/modules/revisions/revisions.controller";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  return updateRevisionContentController(req, contentId);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  return deleteRevisionContentController(contentId);
}
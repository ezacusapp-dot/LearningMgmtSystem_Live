import {
  getCodeScoopByIdController,
  updateCodeScoopController,
  deleteCodeScoopController,
} from "@/modules/code-scoop/code-scoop.controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Next.js 15+: params is a Promise. (On Next 14 use `{ params }: { params: { id: string } }` and `params.id`.)
type Ctx = { params: Promise<{ id: string }> };

export const GET = async (req: Request, { params }: Ctx) => getCodeScoopByIdController(req, (await params).id); // admin
export const PATCH = async (req: Request, { params }: Ctx) => updateCodeScoopController(req, (await params).id); // admin
export const DELETE = async (req: Request, { params }: Ctx) => deleteCodeScoopController(req, (await params).id); // admin

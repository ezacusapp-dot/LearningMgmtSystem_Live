import { createCodeScoopController, getCodeScoopsController } from "@/modules/code-scoop/code-scoop.controller";

export const runtime = "nodejs"; // Prisma needs the Node runtime
export const dynamic = "force-dynamic";

export const POST = (req: Request) => createCodeScoopController(req); // public form
export const GET = (req: Request) => getCodeScoopsController(req); // admin list

// import {createModuleController, getModulesController} from "@/modules/modules/modules.controller";

// export async function POST(req: Request) {
//   return createModuleController(req);
// }

// export async function GET(req: Request) {
//   return getModulesController(req);
// }

// a
// ============================================================
// app/api/modules/route.ts
// ============================================================

import { createModuleController, getModulesController } from "@/modules/modules/modules.controller";

export async function GET(req: Request)  { return getModulesController(req); }
export async function POST(req: Request) { return createModuleController(req); }
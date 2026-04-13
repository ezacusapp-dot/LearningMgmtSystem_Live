import {createModuleController, getModulesController} from "@/modules/modules/modules.controller";

export async function POST(req: Request) {
  return createModuleController(req);
}

export async function GET(req: Request) {
  return getModulesController(req);
}


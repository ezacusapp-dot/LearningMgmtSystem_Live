import {createLevelController,getLevelsController,} from "@/modules/levels/level.controller";

export async function POST(req: Request) {
  return createLevelController(req);
}

export async function GET(req: Request) {
  return getLevelsController(req);
}
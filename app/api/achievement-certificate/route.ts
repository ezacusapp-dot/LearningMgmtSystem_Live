import { NextRequest } from "next/server";
import { achievementCertificateController as controller } from "modules/achievement-certificate/achievement.controller";

// GET  /api/achievement-certificate         -> list (supports ?search=&sortBy=&sortDir=&page=&pageSize=)
// POST /api/achievement-certificate         -> create

export async function GET(req: NextRequest) {
  return controller.list(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}

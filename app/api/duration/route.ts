import {createDurationTypeController,getDurationTypeController,} from "@/modules/duration-type/durationType.controller";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return createDurationTypeController(req);
}

export async function GET(req: Request) {
  return getDurationTypeController(req);
}
import {createDurationTypeController,getDurationTypeController,} from "@/modules/duration-type/durationType.controller";

export async function POST(req: Request) {
  return createDurationTypeController(req);
}

export async function GET(req: Request) {
  return getDurationTypeController(req);
}
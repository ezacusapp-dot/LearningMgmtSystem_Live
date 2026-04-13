import {createLessonController,getLessonsController,} from "@/modules/lessons/lessons.controller";
export const dynamic = "force-dynamic";
export async function GET(req: Request) 
{
  return getLessonsController(req);
}

export async function POST(req: Request)
{
  return createLessonController(req);
}

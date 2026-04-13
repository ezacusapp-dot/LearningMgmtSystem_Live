import {createValidityController,getValidityController,} from "@/modules/validity-period/validityPeriod.controller";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return createValidityController(req);
}

export async function GET(req: Request) {
  return getValidityController(req);
}
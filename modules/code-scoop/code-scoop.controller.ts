import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  validateCreateCodeScoop, validateListCodeScoop, validateUpdateCodeScoop,
} from "./code-scoop.validation";
import {
  createCodeScoopService, getCodeScoopsService, getCodeScoopByIdService,
  updateCodeScoopService, deleteCodeScoopService, ServiceError,
} from "./code-scoop.service";
import { assertAdmin } from "./admin-auth";

// A broken or empty JSON body becomes a clean 400 instead of a 500
const readJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    throw new ServiceError("Invalid request body", 400);
  }
};

const fail = (err: unknown) => {
  if (err instanceof ZodError)
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  if (err instanceof ServiceError)
    return NextResponse.json({ success: false, message: err.message }, { status: err.status });
  console.error(err);
  return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
};

// CREATE – public (the website form)
export const createCodeScoopController = async (req: Request) => {
  try {
    const data = validateCreateCodeScoop(await readJson(req));
    const result = await createCodeScoopService(data);
    return NextResponse.json(
      { success: true, data: result, message: "Subscription request received" },
      { status: 201 }
    );
  } catch (err) {
    return fail(err);
  }
};

// GET list – open (no login check)
export const getCodeScoopsController = async (req: Request) => {
  try {
    const q = validateListCodeScoop(Object.fromEntries(new URL(req.url).searchParams));
    return NextResponse.json({ success: true, ...(await getCodeScoopsService(q)) });
  } catch (err) {
    return fail(err);
  }
};

// GET one – open (no login check)
export const getCodeScoopByIdController = async (req: Request, id: string) => {
  try {
    return NextResponse.json({ success: true, data: await getCodeScoopByIdService(id) });
  } catch (err) {
    return fail(err);
  }
};

// UPDATE – admin
export const updateCodeScoopController = async (req: Request, id: string) => {
  try {
    await assertAdmin(req);
    const data = validateUpdateCodeScoop(await readJson(req));
    return NextResponse.json({
      success: true,
      data: await updateCodeScoopService(id, data),
      message: "Subscription Updated Successfully",
    });
  } catch (err) {
    return fail(err);
  }
};

// DELETE – admin
export const deleteCodeScoopController = async (req: Request, id: string) => {
  try {
    await assertAdmin(req);
    await deleteCodeScoopService(id);
    return NextResponse.json({ success: true, message: "Subscription Deleted Successfully" });
  } catch (err) {
    return fail(err);
  }
};

import { NextRequest, NextResponse } from "next/server";
import { achievementCertificateService as service } from "./achievement.service";
import { idParamSchema } from "./achievement.validation";
import { AppError } from "./achievement.type";
import type { ApiResponseBody } from "./achievement.type";

// ─────────────────────────────────────────────────────────────
// Controller — translates HTTP <-> service calls. No business
// logic here; every rule lives in the service layer.
// ─────────────────────────────────────────────────────────────

function ok<T>(data: T, status = 200) {
  const body: ApiResponseBody<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

function fail(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiResponseBody<never> = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        fieldErrors: error.fieldErrors,
      },
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  console.error("Unexpected error in achievement-certificate controller:", error);
  const body: ApiResponseBody<never> = {
    success: false,
    error: { message: "Internal server error.", code: "INTERNAL_ERROR" },
  };
  return NextResponse.json(body, { status: 500 });
}

export const achievementCertificateController = {
  async list(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const query = Object.fromEntries(url.searchParams.entries());
      
      // Handle float values in query parameters (if any)
      // Example: ?percentFrom=85.5&percentTo=100.0
      if (query.percentFrom) {
        query.percentFrom = parseFloat(query.percentFrom as string);
      }
      if (query.percentTo) {
        query.percentTo = parseFloat(query.percentTo as string);
      }
      
      const result = await service.list(query);
      return ok(result);
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: NextRequest) {
    try {
      const body = await req.json();
      
      // Ensure float values are parsed correctly
      // body.percentFrom and body.percentTo are already numbers from JSON
      // But we can add validation/transformation if needed
      if (body.percentFrom !== undefined && typeof body.percentFrom === 'string') {
        body.percentFrom = parseFloat(body.percentFrom);
      }
      if (body.percentTo !== undefined && typeof body.percentTo === 'string') {
        body.percentTo = parseFloat(body.percentTo);
      }
      
      const created = await service.create(body);
      return ok(created, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async getById(_req: NextRequest, id: string) {
    try {
      const parsedId = idParamSchema.parse(id);
      const cert = await service.getById(parsedId);
      return ok(cert);
    } catch (error) {
      return fail(error);
    }
  },

  async update(req: NextRequest, id: string) {
    try {
      const parsedId = idParamSchema.parse(id);
      const body = await req.json();
      
      // Handle float values in update
      if (body.percentFrom !== undefined && typeof body.percentFrom === 'string') {
        body.percentFrom = parseFloat(body.percentFrom);
      }
      if (body.percentTo !== undefined && typeof body.percentTo === 'string') {
        body.percentTo = parseFloat(body.percentTo);
      }
      
      const updated = await service.update(parsedId, body);
      return ok(updated);
    } catch (error) {
      return fail(error);
    }
  },

  async remove(_req: NextRequest, id: string) {
    try {
      const parsedId = idParamSchema.parse(id);
      const deleted = await service.remove(parsedId);
      return ok(deleted);
    } catch (error) {
      return fail(error);
    }
  },
};
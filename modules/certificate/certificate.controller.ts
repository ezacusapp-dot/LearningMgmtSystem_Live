import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  generateCertificateSchema,
  revokeCertificateSchema,
  certificateListQuerySchema,
} from "./certificate.validation";
import {
  certificateService,
  CertificateServiceError,
} from "./certificate.service";

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (error instanceof CertificateServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error("Unhandled certificate controller error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export const certificateController = {
  async generate(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = generateCertificateSchema.parse(body);
      const certificate = await certificateService.generateCertificate(parsed);
      return NextResponse.json({ data: certificate }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async getById(id: string) {
    try {
      const certificate = await certificateService.getCertificateById(id);
      return NextResponse.json({ data: certificate });
    } catch (error) {
      return handleError(error);
    }
  },

  async list(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const query = certificateListQuerySchema.parse(
        Object.fromEntries(searchParams)
      );
      const result = await certificateService.listCertificates(query);
      return NextResponse.json({
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: Math.ceil(result.total / result.pageSize),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  },

  async listByStudent(req: NextRequest, studentId: string) {
    try {
      const { searchParams } = new URL(req.url);
      const query = certificateListQuerySchema.parse({
        ...Object.fromEntries(searchParams),
        studentId,
      });
      const result = await certificateService.listCertificates(query);
      return NextResponse.json({
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: Math.ceil(result.total / result.pageSize),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  },

  async verify(certificateNumber: string) {
    try {
      const result = await certificateService.verifyCertificate(certificateNumber);
      return NextResponse.json(result, { status: result.valid ? 200 : 404 });
    } catch (error) {
      return handleError(error);
    }
  },

  async revoke(req: NextRequest, id: string) {
    try {
      const body = await req.json();
      const parsed = revokeCertificateSchema.parse(body);
      const certificate = await certificateService.revokeCertificate(id, parsed);
      return NextResponse.json({ data: certificate });
    } catch (error) {
      return handleError(error);
    }
  },
};
// modules/certificate-template/certificateTemplate.controller.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  createCertificateTemplateSchema,
  updateCertificateTemplateSchema,
  certificateTemplateListQuerySchema,
} from './certificateTemplate.validation';
import {
  certificateTemplateService,
  CertificateTemplateServiceError,
} from './certificateTemplate.service';

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (error instanceof CertificateTemplateServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error('Unhandled certificate template controller error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export const certificateTemplateController = {
  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = createCertificateTemplateSchema.parse(body);
      const template = await certificateTemplateService.createTemplate(parsed);
      return NextResponse.json({ data: template }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async getById(id: string) {
    try {
      const template = await certificateTemplateService.getTemplateById(id);
      return NextResponse.json({ data: template });
    } catch (error) {
      return handleError(error);
    }
  },

  async getByCourse(courseId: string) {
    try {
      const template = await certificateTemplateService.getTemplateByCourse(courseId);
      return NextResponse.json({ data: template });
    } catch (error) {
      return handleError(error);
    }
  },

  async list(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const query = certificateTemplateListQuerySchema.parse(
        Object.fromEntries(searchParams)
      );
      const result = await certificateTemplateService.listTemplates(query);
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

  // Used by the certificate builder's "Course" dropdown
  async listCourses() {
    try {
      const courses = await certificateTemplateService.listCourses();
      return NextResponse.json({ data: courses });
    } catch (error) {
      return handleError(error);
    }
  },

  async update(req: NextRequest, id: string) {
    try {
      const body = await req.json();
      const parsed = updateCertificateTemplateSchema.parse(body);
      const template = await certificateTemplateService.updateTemplate(id, parsed);
      return NextResponse.json({ data: template });
    } catch (error) {
      return handleError(error);
    }
  },

  async remove(id: string) {
    try {
      await certificateTemplateService.deleteTemplate(id);
      return NextResponse.json({ data: { id, deleted: true } });
    } catch (error) {
      return handleError(error);
    }
  },
};
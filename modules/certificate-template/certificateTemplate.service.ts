// modules/certificate-template/certificateTemplate.service.ts

import { certificateTemplateRepository } from './certificateTemplate.repository';
import type {
  CreateCertificateTemplateSchemaType,
  UpdateCertificateTemplateSchemaType,
} from './certificateTemplate.validation';
import type { CertificateTemplateListQuery } from './certificateTemplate.types';

export class CertificateTemplateServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CertificateTemplateServiceError';
    this.statusCode = statusCode;
  }
}

export const certificateTemplateService = {
  async createTemplate(input: CreateCertificateTemplateSchemaType) {
    // Validate course exists
    const course = await certificateTemplateRepository.findCourseById(input.courseId);
    if (!course) {
      throw new CertificateTemplateServiceError('Course not found', 404);
    }

    // Check for existing template (one per course)
    const existing = await certificateTemplateRepository.findByCourseId(input.courseId);
    if (existing) {
      throw new CertificateTemplateServiceError(
        'This course already has a certificate template. Use update instead.',
        409
      );
    }

    const { courseId, ...rest } = input;

    return certificateTemplateRepository.create({
      ...rest,
      course: { connect: { id: courseId } },
    });
  },

  async getTemplateById(id: string) {
    const template = await certificateTemplateRepository.findById(id);
    if (!template) {
      throw new CertificateTemplateServiceError('Certificate template not found', 404);
    }
    return template;
  },

  async getTemplateByCourse(courseId: string) {
    const template = await certificateTemplateRepository.findByCourseId(courseId);
    if (!template) {
      throw new CertificateTemplateServiceError(
        'No certificate template configured for this course',
        404
      );
    }
    return template;
  },

  async listTemplates(query: CertificateTemplateListQuery) {
    return certificateTemplateRepository.findMany(query);
  },

  async listCourses() {
    return certificateTemplateRepository.listCourses();
  },

  async updateTemplate(id: string, input: UpdateCertificateTemplateSchemaType) {
    const existing = await certificateTemplateRepository.findById(id);
    if (!existing) {
      throw new CertificateTemplateServiceError('Certificate template not found', 404);
    }

    const { isDraft, ...rest } = input;
    const wasDraft = existing.isDraft;
    const isNowPublished = isDraft === false;

    return certificateTemplateRepository.update(id, {
      ...rest,
      ...(isDraft !== undefined ? { isDraft } : {}),
      ...(isNowPublished && wasDraft ? { publishedAt: new Date() } : {}),
      templateVersion: { increment: 1 },
    });
  },

  async deleteTemplate(id: string) {
    const existing = await certificateTemplateRepository.findById(id);
    if (!existing) {
      throw new CertificateTemplateServiceError('Certificate template not found', 404);
    }

    // Check if certificates have been issued
    const issuedCount = await certificateTemplateRepository.countIssuedCertificates(id);
    if (issuedCount > 0) {
      throw new CertificateTemplateServiceError(
        `Cannot delete: ${issuedCount} certificate(s) have already been issued from this template`,
        409
      );
    }

    return certificateTemplateRepository.delete(id);
  },
};
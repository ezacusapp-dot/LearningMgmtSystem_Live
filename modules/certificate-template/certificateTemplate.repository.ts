// modules/certificate-template/certificateTemplate.repository.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { CertificateTemplateListQuery } from './certificateTemplate.types';

export const certificateTemplateRepository = {
  async findCourseById(courseId: string) {
    return prisma.courses.findUnique({ where: { id: courseId } });
  },

  async findByCourseId(courseId: string) {
    return prisma.certificateTemplate.findUnique({
      where: { courseId },  // ✅ FIXED: Use courseId, not course
      include: { course: true },
    });
  },

  async findById(id: string) {
    return prisma.certificateTemplate.findUnique({
      where: { id },
      include: { course: true },
    });
  },

  async create(data: Prisma.CertificateTemplateCreateInput) {
    return prisma.certificateTemplate.create({
      data,
      include: { course: true },
    });
  },

  async update(id: string, data: Prisma.CertificateTemplateUpdateInput) {
    return prisma.certificateTemplate.update({
      where: { id },
      data,
      include: { course: true },
    });
  },

  async delete(id: string) {
    return prisma.certificateTemplate.delete({ where: { id } });
  },

  async findMany(query: CertificateTemplateListQuery) {
    const { courseId, isDraft, page = 1, pageSize = 20 } = query;

    const where: Prisma.CertificateTemplateWhereInput = {
      ...(courseId ? { courseId } : {}),
      ...(isDraft !== undefined ? { isDraft } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.certificateTemplate.findMany({
        where,
        include: { course: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.certificateTemplate.count({ where }),
    ]);

    return { data, total, page, pageSize };
  },

  async countIssuedCertificates(templateId: string) {
    return prisma.certificate.count({ where: { templateId } });
  },

  async listCourses() {
    return prisma.courses.findMany({
      select: { id: true, title: true, status: true },
      orderBy: { title: 'asc' },
    });
  },
};
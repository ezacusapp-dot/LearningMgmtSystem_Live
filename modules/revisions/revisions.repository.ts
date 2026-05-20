// ============================================================
// revision.repository.ts
// ============================================================

import { prisma } from "@/lib/prisma";
import { CreateRevisionDto, UpdateRevisionDto } from "./revisions.types";

// ================= GET REVISIONS =================
export const getRevisionsRepo = (where: any, skip: number, take: number) =>
  prisma.revision.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      module: { select: { id: true, title: true } },
      contents: { orderBy: { order: "asc" } },
    },
  });

// ================= COUNT =================
export const countRevisionsRepo = (where: any) =>
  prisma.revision.count({ where });

// ================= FIND BY ID =================
export const findRevisionByIdRepo = (id: string) =>
  prisma.revision.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, title: true } },
      contents: { orderBy: { order: "asc" } },
    },
  });

// ================= FIND BY MODULE ID =================
export const findRevisionByModuleIdRepo = (moduleId: string) =>
  prisma.revision.findUnique({
    where: { moduleId },
    include: {
      module: { select: { id: true, title: true } },
      contents: { orderBy: { order: "asc" } },
    },
  });

// ================= CREATE =================
export const createRevisionRepo = (data: CreateRevisionDto) => {
  const { contents, ...revisionData } = data;

  return prisma.revision.create({
    data: {
      ...revisionData,
      ...(contents && contents.length > 0
        ? {
            contents: {
              create: contents.map((c) => ({
                contentType: c.contentType,
                fileUrl: c.fileUrl,
                order: c.order,
              })),
            },
          }
        : {}),
    },
    include: {
      module: { select: { id: true, title: true } },
      contents: { orderBy: { order: "asc" } },
    },
  });
};

// ================= UPDATE =================
export const updateRevisionRepo = (id: string, data: UpdateRevisionDto) => {
  const { contents, ...revisionData } = data;

  return prisma.revision.update({
    where: { id },
    data: {
      ...revisionData,
      ...(contents !== undefined
        ? {
            contents: {
              deleteMany: {},
              create: contents.map((c) => ({
                contentType: c.contentType,
                fileUrl: c.fileUrl,
                order: c.order,
              })),
            },
          }
        : {}),
    },
    include: {
      module: { select: { id: true, title: true } },
      contents: { orderBy: { order: "asc" } },
    },
  });
};

// ================= DELETE =================
export const deleteRevisionRepo = (id: string) =>
  prisma.revision.delete({ where: { id } });

// ================= REVISION CONTENT =================

export const findRevisionContentByIdRepo = (id: string) =>
  prisma.revisionContent.findUnique({ where: { id } });

export const updateRevisionContentRepo = (id: string, data: any) =>
  prisma.revisionContent.update({ where: { id }, data });

export const deleteRevisionContentRepo = (id: string) =>
  prisma.revisionContent.delete({ where: { id } });

export const addRevisionContentRepo = (revisionId: string, data: any) =>
  prisma.revisionContent.create({ data: { revisionId, ...data } });
// ============================================================
// revision.service.ts
// ============================================================

import {
  getRevisionsRepo,
  countRevisionsRepo,
  findRevisionByIdRepo,
  findRevisionByModuleIdRepo,
  createRevisionRepo,
  updateRevisionRepo,
  deleteRevisionRepo,
  findRevisionContentByIdRepo,
  updateRevisionContentRepo,
  deleteRevisionContentRepo,
  addRevisionContentRepo,
} from "./revisions.repository";
import { CreateRevisionDto, UpdateRevisionDto } from "./revisions.types";

// ================= GET REVISIONS =================
export const getRevisionsService = async (query: any) => {
  const page  = Number(query.page)  > 0 ? Number(query.page)  : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const search   = query.search   || "";
  const moduleId = query.moduleId || undefined;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search)   where.title    = { contains: search, mode: "insensitive" };
  if (moduleId) where.moduleId = moduleId;

  const [total, data] = await Promise.all([
    countRevisionsRepo(where),
    getRevisionsRepo(where, skip, limit),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ================= GET REVISION BY ID =================
export const getRevisionByIdService = async (id: string) => {
  const revision = await findRevisionByIdRepo(id);
  if (!revision) throw new Error("Revision not found");
  return revision;
};

// ================= CREATE REVISION =================
export const createRevisionService = async (data: CreateRevisionDto) => {
  // Each module can have only one revision (moduleId is @unique in schema)
  const existing = await findRevisionByModuleIdRepo(data.moduleId);
  if (existing) throw new Error("A revision already exists for this module");

  return createRevisionRepo(data);
};

// ================= UPDATE REVISION =================
export const updateRevisionService = async (
  id: string,
  data: UpdateRevisionDto
) => {
  const existing = await findRevisionByIdRepo(id);
  if (!existing) throw new Error("Revision not found");

  return updateRevisionRepo(id, data);
};

// ================= DELETE REVISION =================
export const deleteRevisionService = async (id: string) => {
  const existing = await findRevisionByIdRepo(id);
  if (!existing) throw new Error("Revision not found");

  return deleteRevisionRepo(id);
};

// ============================================================
// REVISION CONTENT SERVICES
// ============================================================

// ================= ADD CONTENT TO REVISION =================
export const addRevisionContentService = async (
  revisionId: string,
  data: any
) => {
  const revision = await findRevisionByIdRepo(revisionId);
  if (!revision) throw new Error("Revision not found");

  return addRevisionContentRepo(revisionId, data);
};

// ================= UPDATE REVISION CONTENT =================
export const updateRevisionContentService = async (
  contentId: string,
  data: any
) => {
  const existing = await findRevisionContentByIdRepo(contentId);
  if (!existing) throw new Error("Revision content not found");

  return updateRevisionContentRepo(contentId, data);
};

// ================= DELETE REVISION CONTENT =================
export const deleteRevisionContentService = async (contentId: string) => {
  const existing = await findRevisionContentByIdRepo(contentId);
  if (!existing) throw new Error("Revision content not found");

  return deleteRevisionContentRepo(contentId);
};
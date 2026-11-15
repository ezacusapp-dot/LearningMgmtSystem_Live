import { Prisma } from "@prisma/client";
import {
  createCodeScoopRepo, findCodeScoopByIdRepo, findPendingDuplicateRepo,
  getCodeScoopsRepo, countCodeScoopsRepo, updateCodeScoopRepo, deleteCodeScoopRepo,
} from "./code-scoop.repository";
import type { CreateCodeScoopDTO, UpdateCodeScoopDTO, ListCodeScoopQuery } from "./code-scoop.types";

export class ServiceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const makeOrderNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CS-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

// CREATE (public form submit)
export const createCodeScoopService = async (data: CreateCodeScoopDTO) => {
  const dup = await findPendingDuplicateRepo(data.email, data.edition, data.durationMonths);
  if (dup)
    throw new ServiceError(`You already have a pending request for this plan (order ${dup.orderNumber}). We will contact you soon.`, 409);

  // retry a few times in the unlikely event of an order-number collision
  for (let i = 0; i < 3; i++) {
    try {
      const row = await createCodeScoopRepo({
        orderNumber: makeOrderNumber(),
        parentName: data.parentName,
        email: data.email,
        mobile: data.mobile,
        edition: data.edition,
        durationMonths: data.durationMonths,
        deliveryPin: data.pin,
        deliveryAddress: data.address,
        consent: true,
        consentAt: new Date(),
      });
      return { id: row.id, orderNumber: row.orderNumber, paymentStatus: row.paymentStatus };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new ServiceError("Could not create the request. Please try again.", 500);
};

// GET list (admin)
export const getCodeScoopsService = async (q: ListCodeScoopQuery) => {
  const where: Prisma.CodeScoopWhereInput = {};
  if (q.edition) where.edition = q.edition;
  if (q.paymentStatus) where.paymentStatus = q.paymentStatus;
  if (q.search)
    where.OR = [
      { parentName: { contains: q.search, mode: "insensitive" } },
      { email: { contains: q.search, mode: "insensitive" } },
      { mobile: { contains: q.search } },
      { orderNumber: { contains: q.search, mode: "insensitive" } },
    ];

  const skip = (q.page - 1) * q.limit;
  const [total, data] = await Promise.all([
    countCodeScoopsRepo(where),
    getCodeScoopsRepo(where, skip, q.limit),
  ]);
  return { data, meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) } };
};

// GET one (admin)
export const getCodeScoopByIdService = async (id: string) => {
  const row = await findCodeScoopByIdRepo(id);
  if (!row) throw new ServiceError("Subscription not found", 404);
  return row;
};

// UPDATE (admin) – mark paid / unpaid, fix delivery details
export const updateCodeScoopService = async (id: string, data: UpdateCodeScoopDTO) => {
  const existing = await findCodeScoopByIdRepo(id);
  if (!existing) throw new ServiceError("Subscription not found", 404);

  const patch: Prisma.CodeScoopUpdateInput = { ...data };
  if (data.paymentStatus === "PAID" && existing.paymentStatus !== "PAID") patch.paidAt = new Date();
  if (data.paymentStatus === "UNPAID") patch.paidAt = null;
  return updateCodeScoopRepo(id, patch);
};

// DELETE (admin)
export const deleteCodeScoopService = async (id: string) => {
  if (!(await findCodeScoopByIdRepo(id))) throw new ServiceError("Subscription not found", 404);
  return deleteCodeScoopRepo(id);
};

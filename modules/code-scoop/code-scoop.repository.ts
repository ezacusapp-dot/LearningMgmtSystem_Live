import { prisma } from "@/lib/prisma";
import { Prisma, CodeScoopEdition } from "@prisma/client";

export const createCodeScoopRepo = (data: Prisma.CodeScoopCreateInput) =>
  prisma.codeScoop.create({ data });

export const findCodeScoopByIdRepo = (id: string) =>
  prisma.codeScoop.findUnique({ where: { id } });

export const findCodeScoopByOrderNumberRepo = (orderNumber: string) =>
  prisma.codeScoop.findUnique({ where: { orderNumber } });

// same parent + edition + duration that is still unpaid = duplicate submit
export const findPendingDuplicateRepo = (email: string, edition: CodeScoopEdition, durationMonths: number) =>
  prisma.codeScoop.findFirst({
    where: { email, edition, durationMonths, paymentStatus: "UNPAID" },
  });

export const getCodeScoopsRepo = (where: Prisma.CodeScoopWhereInput, skip: number, take: number) =>
  prisma.codeScoop.findMany({ where, skip, take, orderBy: { createdAt: "desc" } });

export const countCodeScoopsRepo = (where: Prisma.CodeScoopWhereInput) =>
  prisma.codeScoop.count({ where });

export const updateCodeScoopRepo = (id: string, data: Prisma.CodeScoopUpdateInput) =>
  prisma.codeScoop.update({ where: { id }, data });

export const deleteCodeScoopRepo = (id: string) =>
  prisma.codeScoop.delete({ where: { id } });

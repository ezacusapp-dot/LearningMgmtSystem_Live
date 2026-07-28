import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AchievementCertificate,
  CreateAchievementCertificateInput,
  UpdateAchievementCertificateInput,
  ListAchievementCertificatesQuery,
  PaginatedResult,
} from "./achievement.type";

// ─────────────────────────────────────────────────────────────
// Repository — the only layer that talks to Prisma directly.
// Keeps persistence concerns isolated from business rules.
// ─────────────────────────────────────────────────────────────


export const achievementCertificateRepository = {
    async findByPercentage(
    percentage: number
  ): Promise<AchievementCertificate | null> {
    return prisma.achievementCertificate.findFirst({
      where: {
        percentFrom: { lte: percentage },
        percentTo: { gte: percentage },
      },
      orderBy: { percentFrom: "asc" },
    });
  },
  async findMany(
    query: ListAchievementCertificatesQuery
  ): Promise<PaginatedResult<AchievementCertificate>> {
    const {
      search,
      sortBy = "percentFrom",
      sortDir = "asc",
      page = 1,
      pageSize = 20,
    } = query;

    const where: Prisma.AchievementCertificateWhereInput = search
      ? {
          OR: [
            { certificateName: { contains: search, mode: "insensitive" } },
            { designation: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.achievementCertificate.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.achievementCertificate.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async findById(id: string): Promise<AchievementCertificate | null> {
    return prisma.achievementCertificate.findUnique({ where: { id } });
  },

  async findByName(certificateName: string): Promise<AchievementCertificate | null> {
    return prisma.achievementCertificate.findUnique({ where: { certificateName } });
  },

  /**
   * Finds bands whose percentage range overlaps with [percentFrom, percentTo]
   * Uses float comparison - handles decimal values correctly
   */
  async findOverlapping(
    percentFrom: number,
    percentTo: number,
    excludeId?: string
  ): Promise<AchievementCertificate[]> {
    // Float comparison: overlap exists when:
    // existing.percentFrom <= new.percentTo AND existing.percentTo >= new.percentFrom
    return prisma.achievementCertificate.findMany({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        AND: [
          { percentFrom: { lte: percentTo } }, // Float comparison (<=)
          { percentTo: { gte: percentFrom } }, // Float comparison (>=)
        ],
      },
      // Optional: Sort by percentFrom for consistent ordering
      orderBy: { percentFrom: "asc" },
    });
  },

  /**
   * Find bands that are completely within a range (for validation)
   * Useful for checking if a range is already fully covered
   */
  async findWithinRange(
    percentFrom: number,
    percentTo: number,
    excludeId?: string
  ): Promise<AchievementCertificate[]> {
    return prisma.achievementCertificate.findMany({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        AND: [
          { percentFrom: { gte: percentFrom } },
          { percentTo: { lte: percentTo } },
        ],
      },
      orderBy: { percentFrom: "asc" },
    });
  },

  async create(
    input: CreateAchievementCertificateInput
  ): Promise<AchievementCertificate> {
    // Prisma automatically handles Float values
    return prisma.achievementCertificate.create({ 
      data: {
        ...input,
        // Ensure values are valid floats (Prisma will handle)
        percentFrom: input.percentFrom,
        percentTo: input.percentTo,
      } 
    });
  },

  async update(
    id: string,
    input: UpdateAchievementCertificateInput
  ): Promise<AchievementCertificate> {
    return prisma.achievementCertificate.update({ 
      where: { id }, 
      data: input 
    });
  },

  async delete(id: string): Promise<AchievementCertificate> {
    return prisma.achievementCertificate.delete({ where: { id } });
  },

  /**
   * Get all bands (useful for bulk operations)
   */
  async findAll(
    sortBy: keyof AchievementCertificate = "percentFrom",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<AchievementCertificate[]> {
    return prisma.achievementCertificate.findMany({
      orderBy: { [sortBy]: sortDir },
    });
  },

  /**
   * Find bands with exact percentage values (useful for debugging)
   */
  async findByExactPercentage(
    percentFrom: number,
    percentTo: number
  ): Promise<AchievementCertificate[]> {
    return prisma.achievementCertificate.findMany({
      where: {
        percentFrom: { equals: percentFrom },
        percentTo: { equals: percentTo },
      },
    });
  },
};

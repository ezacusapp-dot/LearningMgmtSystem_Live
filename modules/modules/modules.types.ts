// // export interface ModuleType {
// //   id?: string;
// //   courseId: string;
// //   title: string;
// //   order: number;
// //   description?: string;
// //   createdAt?: Date;
// //   updatedAt?: Date;
// // }
// export interface ModuleType {
//   id?: string;
//   courseId: string;
//   title: string;
//   order: number;
//   description?: string;
//   isActive?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
// ============================================================
// modules.types.ts
// ============================================================

import { ModuleType as PrismaModuleType } from "@prisma/client";

export interface CreateModuleDto {
  courseId:    string;
  title:       string;
  order:       number;
  type?:       PrismaModuleType;
  description?: string;
  isActive?:   boolean;
}

export interface UpdateModuleDto {
  title?:       string;
  order?:       number;
  type?:        PrismaModuleType;
  description?: string;
  isActive?:    boolean;
}
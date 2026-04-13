// export interface ModuleType {
//   id?: string;
//   courseId: string;
//   title: string;
//   order: number;
//   description?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
export interface ModuleType {
  id?: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
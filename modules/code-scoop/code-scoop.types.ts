import { z } from "zod";
import { createCodeScoopSchema } from "./code-scoop.validation";

export type CreateCodeScoopDTO = z.infer<typeof createCodeScoopSchema>;

export interface UpdateCodeScoopDTO {
  paymentStatus?: "UNPAID" | "PAID";
  deliveryPin?: string;
  deliveryAddress?: string;
}

export interface ListCodeScoopQuery {
  page: number;
  limit: number;
  search?: string;
  edition?: "LEARN" | "DISCOVER" | "CREATE" | "INNOVATE";
  paymentStatus?: "UNPAID" | "PAID";
}

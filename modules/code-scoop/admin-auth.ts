import { verifyToken } from "@/lib/paseto"; // same helper your proxy.ts uses
import { ServiceError } from "./code-scoop.service";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"]; // same roles proxy.ts allows for /admin

const readCookie = (req: Request, name: string) => {
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
};

// Allows: (1) a logged-in ADMIN / SUPER_ADMIN (the "token" cookie), or (2) the x-admin-key header for Postman/scripts.
export const assertAdmin = async (req: Request) => {
  const apiKey = process.env.ADMIN_API_KEY;
  if (apiKey && req.headers.get("x-admin-key") === apiKey) return;

  const auth = req.headers.get("authorization");
  const token = readCookie(req, "token") || (auth?.startsWith("Bearer ") ? auth.slice(7) : null);
  if (!token) throw new ServiceError("Unauthorized", 401);

  let role: string | undefined;
  try {
    const payload = (await verifyToken(token)) as { role?: string };
    role = payload.role?.toUpperCase();
  } catch {
    throw new ServiceError("Unauthorized", 401); // missing, expired or invalid token
  }

  if (!role || !ADMIN_ROLES.includes(role)) throw new ServiceError("Forbidden", 403);
};

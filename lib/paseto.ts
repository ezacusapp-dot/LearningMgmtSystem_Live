import { V3 } from "paseto";
import { createSecretKey, type KeyObject } from "node:crypto";

export const runtime = "nodejs";

let _key: KeyObject | null = null;

function getKey(): KeyObject {
  if (_key) return _key;

  const secret = "8d048c2092bc0e5aa9258064497ea013c6ef5c2c1b6909c78f90af7edbf83787";
  if (!secret) throw new Error("PASETO_SECRET is not set in environment variables.");

  const keyBytes = Buffer.from(secret, "hex");
  if (keyBytes.length !== 32) {
    throw new Error(`PASETO_SECRET must decode to exactly 32 bytes (got ${keyBytes.length}).`);
  }

  _key = createSecretKey(keyBytes);
  return _key;
}

export async function generateToken(payload: Record<string, unknown>, expiresIn = "2h") {
  const key = getKey();
  return await V3.encrypt(payload, key, { expiresIn });
}

export async function verifyToken(token: string) {
  const key = getKey();
  return await V3.decrypt(token, key);
}
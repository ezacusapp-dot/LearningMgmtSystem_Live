import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  CertificateMasterRow,
  DEFAULT_CERTIFICATE_MASTER,
  validateCertificateMaster,
} from "modules/achievement-certificate/certificateMaster";

const DATA_FILE = path.join(process.cwd(), "data", "certificate-master.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_CERTIFICATE_MASTER, null, 2));
  }
}

// GET /api/certificate-master -> returns the current master list
export async function GET() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return NextResponse.json(JSON.parse(raw) as CertificateMasterRow[]);
}

// PUT /api/certificate-master -> validates and replaces the master list (used by the admin Save button)
export async function PUT(request: NextRequest) {
  await ensureFile();
  const body = await request.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Master data must be an array" }, { status: 400 });
  }

  const errors = validateCertificateMaster(body as CertificateMasterRow[]);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true, data: body });
}
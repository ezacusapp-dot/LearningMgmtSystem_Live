


// app/api/students/certificate/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/paseto";
import {
  getCertificatePdfForDownload,
  CertificateIssuanceError,
} from "modules/certificate-issuance/certificateIssuance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // covers the rare first-time render; cached hits return in milliseconds

async function getStudentIdFromToken(req: NextRequest): Promise<number | null> {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    if (!payload || payload.id === undefined || payload.id === null) return null;
    const studentId =
      typeof payload.id === "number" ? payload.id : parseInt(String(payload.id), 10);
    return isNaN(studentId) ? null : studentId;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ status: false, message: "Certificate ID is required" }, { status: 400 });
  }

  const studentId = await getStudentIdFromToken(req);
  if (!studentId) {
    return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const disposition = searchParams.get("disposition") === "inline" ? "inline" : "attachment";

  try {
    // Cached on every call after the first — see certificateIssuance.service.ts
    const { cert, pdfBuffer } = await getCertificatePdfForDownload(id, studentId);

    // NextResponse's body type expects Uint8Array<ArrayBuffer>, but newer
    // @types/node makes Buffer generic over ArrayBufferLike, so passing a
    // Buffer directly fails type-checking at build time even though it
    // works fine at runtime. Wrapping it in a plain Uint8Array satisfies
    // the type without copying (it shares the same underlying memory).
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="certificate-${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, max-age=0, no-cache",
      },
    });
  } catch (err) {
    if (err instanceof CertificateIssuanceError) {
      return NextResponse.json({ status: false, message: err.message }, { status: 404 });
    }
    console.error("Certificate download error:", err);
    return NextResponse.json(
      { status: false, message: err instanceof Error ? err.message : "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
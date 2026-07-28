
// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";
// import { getStudentIdFromSession } from "@/lib/auth";
// import { getCertificateForDownload } from "@/modules/certificate-issuance/certificateIssuance.service";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const studentId = await getStudentIdFromSession(req);
//     if (!studentId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Next.js 15+ makes route params async — must be awaited before use.
//     const { id } = await params;

//     const cert = await getCertificateForDownload(id, studentId);
//     if (!cert.pdfUrl) {
//       return NextResponse.json({ error: "Certificate PDF not available" }, { status: 404 });
//     }

//     const filePath = path.join(process.cwd(), "public", cert.pdfUrl);

//     let fileBuffer: Buffer;
//     try {
//       fileBuffer = await fs.readFile(filePath);
//     } catch {
//       return NextResponse.json(
//         { error: "Certificate file is missing on the server" },
//         { status: 404 }
//       );
//     }

//     return new NextResponse(fileBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
//         "Cache-Control": "private, no-store",
//       },
//     });
//   } catch (error) {
//     console.error("Certificate download error:", error);
//     return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getStudentIdFromSession } from "@/lib/auth";
import { getCertificateForDownload } from "@/modules/certificate-issuance/certificateIssuance.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentId = await getStudentIdFromSession(req);

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const cert = await getCertificateForDownload(id, studentId);

    if (!cert.pdfUrl) {
      return NextResponse.json(
        { error: "Certificate PDF not available" },
        { status: 404 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      cert.pdfUrl
    );

    let fileBuffer: Buffer;

    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        {
          error: "Certificate file is missing on the server",
        },
        {
          status: 404,
        }
      );
    }

    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Certificate download error:", error);

    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }
}
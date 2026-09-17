


// import { NextRequest, NextResponse } from "next/server";
// import { getStudentIdFromSession } from "@/lib/auth";
// import { getCertificateForDownload } from "@/modules/certificate-issuance/certificateIssuance.service";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   try {
//     const studentId = await getStudentIdFromSession(req);
//     if (!studentId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // "inline" -> renders in browser/iframe (used for preview)
//     // "attachment" (default) -> forces a save dialog (used for real downloads)
//     const disposition =
//       req.nextUrl.searchParams.get("disposition") === "inline"
//         ? "inline"
//         : "attachment";

//     const cert = await getCertificateForDownload(id, studentId);

//     if (!cert.pdfUrl) {
//       console.error(`[cert-download] ${id}: no pdfUrl on record`);
//       return NextResponse.json(
//         { error: "Certificate PDF not available" },
//         { status: 404 }
//       );
//     }

//     const isRemote =
//       cert.pdfUrl.startsWith("http://") || cert.pdfUrl.startsWith("https://");

//     console.log(
//       `[cert-download] ${id}: pdfUrl=${cert.pdfUrl} isRemote=${isRemote} disposition=${disposition}`
//     );

//     // Vercel's filesystem is read-only/ephemeral at runtime, so a local
//     // relative path here almost always means the PDF was never actually
//     // uploaded to Blob storage when it was generated (e.g. missing
//     // BLOB_READ_WRITE_TOKEN, or a fallback path that only works locally).
//     if (!isRemote) {
//       const fs = await import("fs/promises");
//       const path = await import("path");
//       try {
//         const fileBuffer = await fs.readFile(
//           path.join(process.cwd(), "public", cert.pdfUrl)
//         );
//         return new NextResponse(new Uint8Array(fileBuffer), {
//           headers: {
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `${disposition}; filename="${cert.certificateNumber}.pdf"`,
//             "Cache-Control": "private, no-store",
//           },
//         });
//       } catch (err) {
//         console.error(
//           `[cert-download] ${id}: local file missing at ${cert.pdfUrl}`,
//           err
//         );
//         return NextResponse.json(
//           {
//             error:
//               "Certificate file is missing on the server. It may not have been uploaded to storage correctly.",
//           },
//           { status: 404 }
//         );
//       }
//     }

//     // For inline previews of a remote (Blob) file, redirect straight to the
//     // Blob URL instead of proxying bytes ourselves. This preserves range
//     // requests (which PDF viewers rely on for "not cached" errors) and
//     // avoids buffering the whole file through this function.
//     if (disposition === "inline") {
//       return NextResponse.redirect(cert.pdfUrl);
//     }

//     // For real downloads, proxy the bytes so we control the filename and
//     // force a save dialog via Content-Disposition.
//     const blobRes = await fetch(cert.pdfUrl);
//     if (!blobRes.ok) {
//       console.error(
//         `[cert-download] ${id}: blob fetch failed status=${blobRes.status} url=${cert.pdfUrl}`
//       );
//       return NextResponse.json(
//         { error: "Certificate file is missing on the server" },
//         { status: 404 }
//       );
//     }

//     const fileBuffer = Buffer.from(await blobRes.arrayBuffer());

//     return new NextResponse(new Uint8Array(fileBuffer), {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
//         "Cache-Control": "private, no-store",
//       },
//     });
//   } catch (error) {
//     console.error(`[cert-download] ${id}: unexpected error`, error);
//     return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
//   }
// }


// app/api/students/certificate/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/paseto";
import {
  getCertificatePdfForDownload,
  CertificateIssuanceError,
} from "modules/certificate-issuance/certificateIssuance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Puppeteer render can take longer than the default timeout

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
    // 🔑 No caching, no pdfUrl, no fetch/disk read — this renders the PDF
    // live, right now, with Puppeteer, and gives us the buffer directly.
    const { cert, pdfBuffer } = await getCertificatePdfForDownload(id, studentId);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="certificate-${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, max-age=0, no-cache",
      },
    });
  } catch (err) {
    if (err instanceof CertificateIssuanceError) {
      // This is the exact "not found" you're seeing if the certificate row
      // doesn't exist for this id+studentId — e.g. wrong id passed in, or
      // the student clicking a cert that belongs to someone else.
      return NextResponse.json({ status: false, message: err.message }, { status: 404 });
    }
    console.error("Certificate download error:", err);
    return NextResponse.json(
      { status: false, message: err instanceof Error ? err.message : "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
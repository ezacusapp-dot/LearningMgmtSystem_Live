// import { NextRequest, NextResponse } from "next/server";
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

//     const { id } = await params;

//     // "inline" -> renders in browser/iframe (used for preview)
//     // "attachment" (default) -> forces a save dialog (used for real downloads)
//     const disposition = req.nextUrl.searchParams.get("disposition") === "inline"
//       ? "inline"
//       : "attachment";

//     const cert = await getCertificateForDownload(id, studentId);
//     if (!cert.pdfUrl) {
//       return NextResponse.json({ error: "Certificate PDF not available" }, { status: 404 });
//     }

//     // Handles both a full Blob URL and a local relative path
//     const isRemote = cert.pdfUrl.startsWith("http://") || cert.pdfUrl.startsWith("https://");

//     let fileBuffer: ArrayBuffer | Buffer;
//     if (isRemote) {
//       const blobRes = await fetch(cert.pdfUrl);
//       if (!blobRes.ok) {
//         return NextResponse.json(
//           { error: "Certificate file is missing on the server" },
//           { status: 404 }
//         );
//       }
//       fileBuffer = await blobRes.arrayBuffer();
//     } else {
//       const fs = await import("fs/promises");
//       const path = await import("path");
//       try {
//         fileBuffer = await fs.readFile(path.join(process.cwd(), "public", cert.pdfUrl));
//       } catch {
//         return NextResponse.json(
//           { error: "Certificate file is missing on the server" },
//           { status: 404 }
//         );
//       }
//     }

//     return new NextResponse(fileBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `${disposition}; filename="${cert.certificateNumber}.pdf"`,
//         "Cache-Control": "private, no-store",
//       },
//     });
//   } catch (error) {
//     console.error("Certificate download error:", error);
//     return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
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

//     const { id } = await params;

//     const cert = await getCertificateForDownload(id, studentId);
//     if (!cert.pdfUrl) {
//       return NextResponse.json({ error: "Certificate PDF not available" }, { status: 404 });
//     }

//     // 🔑 cert.pdfUrl is now a full Vercel Blob URL (e.g.
//     // https://xxxx.public.blob.vercel-storage.com/certificates/CERT-...pdf)
//     // instead of a local /certificates/... path, since PDFs are generated
//     // and stored in Vercel Blob rather than on local disk (which doesn't
//     // persist on Vercel's serverless filesystem). Fetch it and stream the
//     // bytes back to the client with our own attachment headers, so the
//     // download still gets a clean filename and forces a save dialog
//     // rather than opening inline.
//     const blobRes = await fetch(cert.pdfUrl);
//     if (!blobRes.ok) {
//       return NextResponse.json(
//         { error: "Certificate file is missing on the server" },
//         { status: 404 }
//       );
//     }

//     const fileBuffer = await blobRes.arrayBuffer();

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
import { getStudentIdFromSession } from "@/lib/auth";
import { getCertificateForDownload } from "@/modules/certificate-issuance/certificateIssuance.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // "inline" -> renders in browser/iframe (used for preview)
    // "attachment" (default) -> forces a save dialog (used for real downloads)
    const disposition = req.nextUrl.searchParams.get("disposition") === "inline"
      ? "inline"
      : "attachment";

    const cert = await getCertificateForDownload(id, studentId);
    if (!cert.pdfUrl) {
      return NextResponse.json({ error: "Certificate PDF not available" }, { status: 404 });
    }

    // Handles both a full Blob URL and a local relative path
    const isRemote = cert.pdfUrl.startsWith("http://") || cert.pdfUrl.startsWith("https://");

    let fileBuffer: Buffer;

    if (isRemote) {
      const blobRes = await fetch(cert.pdfUrl);
      if (!blobRes.ok) {
        return NextResponse.json(
          { error: "Certificate file is missing on the server" },
          { status: 404 }
        );
      }
      fileBuffer = Buffer.from(await blobRes.arrayBuffer());
    } else {
      const fs = await import("fs/promises");
      const path = await import("path");
      try {
        fileBuffer = await fs.readFile(path.join(process.cwd(), "public", cert.pdfUrl));
      } catch {
        return NextResponse.json(
          { error: "Certificate file is missing on the server" },
          { status: 404 }
        );
      }
    }

    // Wrap in a plain Uint8Array so the type checker is happy with BodyInit
    // regardless of how strict @types/node is about Buffer's generic param.
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
}
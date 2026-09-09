

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

//     let fileBuffer: Buffer;

//     if (isRemote) {
//       const blobRes = await fetch(cert.pdfUrl);
//       if (!blobRes.ok) {
//         return NextResponse.json(
//           { error: "Certificate file is missing on the server" },
//           { status: 404 }
//         );
//       }
//       fileBuffer = Buffer.from(await blobRes.arrayBuffer());
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

//     // Wrap in a plain Uint8Array so the type checker is happy with BodyInit
//     // regardless of how strict @types/node is about Buffer's generic param.
//     return new NextResponse(new Uint8Array(fileBuffer), {
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


import { NextRequest, NextResponse } from "next/server";
import { getStudentIdFromSession } from "@/lib/auth";
import { getCertificateForDownload } from "@/modules/certificate-issuance/certificateIssuance.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const studentId = await getStudentIdFromSession(req);
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // "inline" -> renders in browser/iframe (used for preview)
    // "attachment" (default) -> forces a save dialog (used for real downloads)
    const disposition =
      req.nextUrl.searchParams.get("disposition") === "inline"
        ? "inline"
        : "attachment";

    const cert = await getCertificateForDownload(id, studentId);

    if (!cert.pdfUrl) {
      console.error(`[cert-download] ${id}: no pdfUrl on record`);
      return NextResponse.json(
        { error: "Certificate PDF not available" },
        { status: 404 }
      );
    }

    const isRemote =
      cert.pdfUrl.startsWith("http://") || cert.pdfUrl.startsWith("https://");

    console.log(
      `[cert-download] ${id}: pdfUrl=${cert.pdfUrl} isRemote=${isRemote} disposition=${disposition}`
    );

    // Vercel's filesystem is read-only/ephemeral at runtime, so a local
    // relative path here almost always means the PDF was never actually
    // uploaded to Blob storage when it was generated (e.g. missing
    // BLOB_READ_WRITE_TOKEN, or a fallback path that only works locally).
    if (!isRemote) {
      const fs = await import("fs/promises");
      const path = await import("path");
      try {
        const fileBuffer = await fs.readFile(
          path.join(process.cwd(), "public", cert.pdfUrl)
        );
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `${disposition}; filename="${cert.certificateNumber}.pdf"`,
            "Cache-Control": "private, no-store",
          },
        });
      } catch (err) {
        console.error(
          `[cert-download] ${id}: local file missing at ${cert.pdfUrl}`,
          err
        );
        return NextResponse.json(
          {
            error:
              "Certificate file is missing on the server. It may not have been uploaded to storage correctly.",
          },
          { status: 404 }
        );
      }
    }

    // For inline previews of a remote (Blob) file, redirect straight to the
    // Blob URL instead of proxying bytes ourselves. This preserves range
    // requests (which PDF viewers rely on for "not cached" errors) and
    // avoids buffering the whole file through this function.
    if (disposition === "inline") {
      return NextResponse.redirect(cert.pdfUrl);
    }

    // For real downloads, proxy the bytes so we control the filename and
    // force a save dialog via Content-Disposition.
    const blobRes = await fetch(cert.pdfUrl);
    if (!blobRes.ok) {
      console.error(
        `[cert-download] ${id}: blob fetch failed status=${blobRes.status} url=${cert.pdfUrl}`
      );
      return NextResponse.json(
        { error: "Certificate file is missing on the server" },
        { status: 404 }
      );
    }

    const fileBuffer = Buffer.from(await blobRes.arrayBuffer());

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(`[cert-download] ${id}: unexpected error`, error);
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { put, del, list } from '@vercel/blob';

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg", 
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: PNG, JPG, SVG, WebP`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobPath = `${folder}/${timestamp}-${safeFileName}`;
    
    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false, // We already added timestamp
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        pathname: blob.pathname,
        fileName: safeFileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
      message: "File uploaded successfully",
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    
    // More specific error messages
    let errorMessage = "Failed to upload file";
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      errorMessage = "Missing Blob token. Please configure BLOB_READ_WRITE_TOKEN";
    } else if (error.message?.includes('rate limit')) {
      errorMessage = "Upload rate limit exceeded. Please try again later";
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


// Optional: Add DELETE endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: "No URL provided" },
        { status: 400 }
      );
    }
    
    await del(url);
    
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
// app/api/uploads/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB for base64

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // Validate size (keep smaller for base64)
//     if (file.size > MAX_FILE_SIZE) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `File size exceeds 1MB limit for base64 encoding`,
//         },
//         { status: 400 }
//       );
//     }

//     // Convert to base64
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const base64 = buffer.toString('base64');
//     const dataUrl = `data:${file.type};base64,${base64}`;

//     return NextResponse.json({
//       success: true,
//       data: {
//         url: dataUrl,
//         fileName: file.name,
//         originalName: file.name,
//         size: file.size,
//         type: file.type,
//         uploadedAt: new Date().toISOString(),
//       },
//       message: "File uploaded successfully",
//     });
    
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to upload file" },
//       { status: 500 }
//     );
//   }
// }
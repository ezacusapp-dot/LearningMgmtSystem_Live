// import { prisma } from "@/lib/prisma";
// import { generateToken } from "@/lib/paseto";
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// //import { excludePassword } from "@/lib/utils"; // Create this helper

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { username, password } = await req.json();

//     // 1. Find student by username with all fields
//     const student = await prisma.student.findUnique({
//       where: { username },
//     });

//     if (!student) {
//       return NextResponse.json(
//         { message: "Invalid username or password" },
//         { status: 401 }
//       );
//     }

//     // 2. Verify password
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return NextResponse.json(
//         { message: "Invalid username or password" },
//         { status: 401 }
//       );
//     }

//     // 3. Prepare student data for token (exclude sensitive fields)
//     const studentData = {
//       id: student.id,
//       username: student.username,
//       firstName: student.firstName,
//       middleName: student.middleName,
//       lastName: student.lastName,
//       studentEmail: student.studentEmail,
//       studentMobile: student.studentMobile,
//       parentMobile: student.parentMobile,
//       parentEmail: student.parentEmail,
//       standard: student.standard,
//       batch: student.batch,
//       schoolYear: student.schoolYear,
//       address: student.address,
//       status: student.status,
//       role: "STUDENT",
//       createdAt: student.createdAt.toISOString(),
//     };

//     // 4. Generate PASETO token with full student data
//     const token = await generateToken(studentData, "2h");

//     // 5. Remove password from response
//     const { password: _, ...studentWithoutPassword } = student;

//     // 6. Return full student info + token
//     return NextResponse.json(
//       {
//         success: true,
//         student: studentWithoutPassword,
//         token,
//       },
//       {
//         headers: {
//           "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200`,
//         },
//       }
//     );
//   } catch (error) {
//     const message = error instanceof Error ? error.message : String(error);
//     console.error("STUDENT LOGIN ERROR:", message, error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error", detail: message },
//       { status: 500 }
//     );
//   }
// }
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/paseto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const student = await prisma.student.findUnique({
      where: { username },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // id is kept as the plain numeric Student.id — lib/auth.ts reads
    // payload.id directly off this token, so don't change this shape
    // without updating getStudentFromSession() too.
    const studentData = {
      id: student.id,
      username: student.username,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      studentEmail: student.studentEmail,
      studentMobile: student.studentMobile,
      parentMobile: student.parentMobile,
      parentEmail: student.parentEmail,
      standard: student.standard,
      batch: student.batch,
      schoolYear: student.schoolYear,
      address: student.address,
      status: student.status,
      role: "STUDENT",
      createdAt: student.createdAt.toISOString(),
    };

    const token = await generateToken(studentData, "2h");

    const { password: _, ...studentWithoutPassword } = student;

    return NextResponse.json(
      {
        success: true,
        student: studentWithoutPassword,
        token,
      },
      {
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200`,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("STUDENT LOGIN ERROR:", message, error);
    return NextResponse.json(
      { success: false, message: "Internal server error", detail: message },
      { status: 500 }
    );
  }
}

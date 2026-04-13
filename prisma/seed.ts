// prisma/seed.ts
import { PrismaClient , UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Course Levels
  // ✅ Seed Users
 const users = [
    {
      name: "Dr. James Anderson",
      email: "admin@gmail.com",
      password: "123",
      role: UserRole.SUPER_ADMIN,
    },
    {
      name: "Priya Mehta",
      email: "priya.mehta@lincolnhs.edu",
      password: "demo123",
      role: UserRole.SCHOOL_ADMIN,
    },
    {
      name: "Aisha Tendulkar",
      email: "aisha.tendulkar@school.edu",
      password: "demo123",
      role: UserRole.STUDENT,
    },
    {
      name: "Parent of Aisha",
      email: "parent.aisha@gmail.com",
      password: "demo123",
      role: UserRole.PARENT,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role ,
      },
    });
  }
  console.log("Users seeded");

  // ✅ Seed Course Levels
  const levels = [
    { name: "Beginner", sortOrder: 1 },
    { name: "Intermediate", sortOrder: 2 },
    { name: "Advanced", sortOrder: 3 },
    { name: "Expert", sortOrder: 4 },
    { name: "Professional", sortOrder: 5 },
  ];

  for (const level of levels) {
    await prisma.courseLevel.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }
  console.log("Course levels seeded");

  // ✅ Seed Validity Periods
  const validityPeriods = [
    { name: "Lifetime", sortOrder: 1 },
    { name: "1 Year", sortOrder: 2 },
    { name: "2 Years", sortOrder: 3 },
    { name: "3 Years", sortOrder: 4 },
    { name: "5 Years", sortOrder: 5 },
  ];

  for (const item of validityPeriods) {
    await prisma.validityPeriod.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }
  console.log("Validity periods seeded");

  // ✅ Seed Duration Types
  const durationTypes = [
    { name: "Self-Paced", sortOrder: 1 },
    { name: "1 Week", sortOrder: 2 },
    { name: "2 Weeks", sortOrder: 3 },
    { name: "1 Month", sortOrder: 4 },
    { name: "3 Months", sortOrder: 5 },
    { name: "6 Months", sortOrder: 6 },
    { name: "1 Year", sortOrder: 7 },
  ];

  for (const dt of durationTypes) {
    await prisma.courseDurationType.upsert({
      where: { name: dt.name },
      update: {},
      create: dt,
    });
  }
  console.log("Duration types seeded");

  // ✅ Seed Award Categories
  const awardCategories = [
    { name: "Completion", sortOrder: 1 },
    { name: "Excellence", sortOrder: 2 },
    { name: "Merit", sortOrder: 3 },
    { name: "Distinction", sortOrder: 4 },
  ];

  for (const ac of awardCategories) {
    await prisma.awardCategory.upsert({
      where: { name: ac.name },
      update: {},
      create: ac,
    });
  }
  console.log("Award categories seeded");

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, DepartmentType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Departments
  const engineering = await prisma.department.upsert({
    where: { code: "CSE" },
    update: {},
    create: {
      name: "Computer Science & Engineering",
      code: "CSE",
      type: DepartmentType.ENGINEERING,
    },
  });

  const management = await prisma.department.upsert({
    where: { code: "MBA" },
    update: {},
    create: {
      name: "Management",
      code: "MBA",
      type: DepartmentType.MANAGEMENT,
    },
  });

  const pharmacy = await prisma.department.upsert({
    where: { code: "BPHARM" },
    update: {},
    create: {
      name: "Pharmacy",
      code: "BPHARM",
      type: DepartmentType.PHARMACY,
    },
  });

  // CSE Subjects
  const subjects = [
    { name: "Programming in C", code: "CSE101", semester: 1 },
    { name: "Engineering Mathematics I", code: "CSE102", semester: 1 },
    { name: "Engineering Physics", code: "CSE103", semester: 1 },
    { name: "Data Structures", code: "CSE201", semester: 2 },
    { name: "Object Oriented Programming", code: "CSE202", semester: 2 },
    { name: "Database Management System", code: "CSE301", semester: 3 },
    { name: "Operating Systems", code: "CSE302", semester: 3 },
    { name: "Computer Networks", code: "CSE303", semester: 3 },
    { name: "Software Engineering", code: "CSE401", semester: 4 },
    { name: "Web Technology", code: "CSE402", semester: 4 },
    { name: "Artificial Intelligence", code: "CSE501", semester: 5 },
    { name: "Machine Learning", code: "CSE502", semester: 5 },
    { name: "Deep Learning", code: "CSE601", semester: 6 },
    { name: "Cloud Computing", code: "CSE602", semester: 6 },
    { name: "Cyber Security", code: "CSE603", semester: 6 },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: {
        code: subject.code,
      },
      update: {},
      create: {
        ...subject,
        departmentId: engineering.id,
      },
    });
  }

  console.log("✅ Database Seeded Successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
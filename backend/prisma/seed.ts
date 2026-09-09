import {
  PrismaClient,
  DepartmentType,
  OpportunityType,
  ModerationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function main() {
  console.log("🌱 Seeding Elaris-One demo data...");

  // =========================================================
  // 1. DEPARTMENTS
  // =========================================================

  const engineering = await prisma.department.upsert({
    where: { code: "CSE" },
    update: {},
    create: {
      name: "Computer Science & Engineering",
      code: "CSE",
      type: DepartmentType.ENGINEERING,
    },
  });

  await prisma.department.upsert({
    where: { code: "MBA" },
    update: {},
    create: {
      name: "Management",
      code: "MBA",
      type: DepartmentType.MANAGEMENT,
    },
  });

  await prisma.department.upsert({
    where: { code: "BPHARM" },
    update: {},
    create: {
      name: "Pharmacy",
      code: "BPHARM",
      type: DepartmentType.PHARMACY,
    },
  });

  // =========================================================
  // 2. SUBJECTS
  // =========================================================

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

  const subjectMap: Record<string, string> = {};

  for (const subject of subjects) {
    const created = await prisma.subject.upsert({
      where: { code: subject.code },
      update: {
        name: subject.name,
        semester: subject.semester,
        departmentId: engineering.id,
      },
      create: {
        ...subject,
        departmentId: engineering.id,
      },
    });

    subjectMap[subject.code] = created.id;
  }

  // =========================================================
  // 3. FIND EXISTING USER
  // =========================================================

  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!user) {
    throw new Error(
      "No active user found. Please register/login once before running the seed."
    );
  }

  console.log(`👤 Using existing user: ${user.fullName}`);

  // =========================================================
  // 4. DEMO NOTES
  // =========================================================

  const notes = [
    {
      title: "DBMS Complete Study Notes",
      description:
        "Complete revision notes covering DBMS fundamentals, ER models, normalization, SQL and transactions.",
      subjectCode: "CSE301",
      semester: 3,
      downloads: 128,
    },
    {
      title: "Operating Systems Unit-wise Notes",
      description:
        "Unit-wise notes covering processes, threads, CPU scheduling, synchronization, deadlocks and memory management.",
      subjectCode: "CSE302",
      semester: 3,
      downloads: 96,
    },
    {
      title: "Computer Networks Quick Revision",
      description:
        "Concise notes covering OSI model, TCP/IP, routing, transport layer and network security fundamentals.",
      subjectCode: "CSE303",
      semester: 3,
      downloads: 84,
    },
    {
      title: "Data Structures Complete Notes",
      description:
        "Important concepts of arrays, linked lists, stacks, queues, trees, graphs and sorting algorithms.",
      subjectCode: "CSE201",
      semester: 2,
      downloads: 152,
    },
    {
      title: "Object Oriented Programming Notes",
      description:
        "Core OOP concepts including classes, objects, inheritance, polymorphism, abstraction and encapsulation.",
      subjectCode: "CSE202",
      semester: 2,
      downloads: 73,
    },
    {
      title: "Artificial Intelligence Fundamentals",
      description:
        "Introduction to intelligent agents, search algorithms, knowledge representation and machine learning.",
      subjectCode: "CSE501",
      semester: 5,
      downloads: 112,
    },
    {
      title: "Machine Learning Revision Notes",
      description:
        "Revision material covering supervised learning, unsupervised learning, regression, classification and evaluation.",
      subjectCode: "CSE502",
      semester: 5,
      downloads: 137,
    },
    {
      title: "Web Technology Exam Notes",
      description:
        "HTML, CSS, JavaScript, HTTP, web architecture and modern web development concepts.",
      subjectCode: "CSE402",
      semester: 4,
      downloads: 65,
    },
  ];

  for (const note of notes) {
    const data = {
      title: note.title,
      description: note.description,
      downloads: note.downloads,
      subjectId: subjectMap[note.subjectCode],
      uploadedById: user.id,
      branch: "CSE-AIML",
      isApproved: true,
      isPublic: true,
      pdfUrl: DEMO_PDF,
      semester: note.semester,
      moderatedAt: new Date(),
      moderationCategories: [],
      moderationReasons: [],
      moderationScore: 0.99,
      moderationStatus: ModerationStatus.APPROVED,
      moderationSummary: "Demo academic content approved for use.",
    };

    const existing = await prisma.note.findFirst({
      where: {
        title: note.title,
        uploadedById: user.id,
      },
    });

    if (existing) {
      await prisma.note.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.note.create({ data });
    }
  }

  console.log("📚 8 demo notes ready.");

  // =========================================================
  // 5. DEMO PYQs
  // =========================================================

  const pyqs = [
    {
      title: "DBMS End Semester Question Paper",
      year: 2025,
      subjectCode: "CSE301",
      semester: 3,
      downloads: 214,
    },
    {
      title: "Operating Systems End Semester Question Paper",
      year: 2025,
      subjectCode: "CSE302",
      semester: 3,
      downloads: 187,
    },
    {
      title: "Computer Networks Previous Year Paper",
      year: 2025,
      subjectCode: "CSE303",
      semester: 3,
      downloads: 164,
    },
    {
      title: "Data Structures Previous Year Paper",
      year: 2024,
      subjectCode: "CSE201",
      semester: 2,
      downloads: 201,
    },
    {
      title: "Object Oriented Programming Previous Year Paper",
      year: 2024,
      subjectCode: "CSE202",
      semester: 2,
      downloads: 143,
    },
    {
      title: "Artificial Intelligence Previous Year Paper",
      year: 2025,
      subjectCode: "CSE501",
      semester: 5,
      downloads: 176,
    },
    {
      title: "Machine Learning Previous Year Paper",
      year: 2025,
      subjectCode: "CSE502",
      semester: 5,
      downloads: 192,
    },
    {
      title: "Web Technology Previous Year Paper",
      year: 2024,
      subjectCode: "CSE402",
      semester: 4,
      downloads: 121,
    },
  ];

  for (const pyq of pyqs) {
    const data = {
      title: pyq.title,
      year: pyq.year,
      subjectId: subjectMap[pyq.subjectCode],
      uploadedById: user.id,
      branch: "CSE-AIML",
      downloads: pyq.downloads,
      pdfUrl: DEMO_PDF,
      semester: pyq.semester,
      moderatedAt: new Date(),
      moderationCategories: [],
      moderationReasons: [],
      moderationScore: 0.99,
      moderationStatus: ModerationStatus.APPROVED,
      moderationSummary: "Demo academic content approved for use.",
    };

    const existing = await prisma.pYQ.findFirst({
      where: {
        title: pyq.title,
        uploadedById: user.id,
      },
    });

    if (existing) {
      await prisma.pYQ.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.pYQ.create({ data });
    }
  }

  console.log("📝 8 demo PYQs ready.");

  // =========================================================
  // 6. DEMO OPPORTUNITIES
  // =========================================================

  const opportunities = [
    {
      title: "AI/ML Summer Internship",
      description:
        "Summer internship opportunity for students interested in artificial intelligence, machine learning and data-driven applications.",
      company: "Tech Innovations",
      type: OpportunityType.INTERNSHIP,
      location: "Remote",
      applyLink: "https://example.com/apply-ai-ml",
      deadline: new Date("2026-10-15"),
    },
    {
      title: "Full Stack Developer Internship",
      description:
        "Hands-on internship focused on React, Node.js, REST APIs and modern web application development.",
      company: "WebWorks Labs",
      type: OpportunityType.INTERNSHIP,
      location: "Remote",
      applyLink: "https://example.com/apply-fullstack",
      deadline: new Date("2026-10-25"),
    },
    {
      title: "Campus Coding Hackathon",
      description:
        "Build innovative software solutions and compete with student teams in a developer-focused hackathon.",
      company: "Developer Community",
      type: OpportunityType.HACKATHON,
      location: "Indore",
      applyLink: "https://example.com/hackathon",
      deadline: new Date("2026-10-05"),
    },
    {
      title: "Software Developer Graduate Opportunity",
      description:
        "Entry-level software development opportunity for students with strong programming and problem-solving skills.",
      company: "NextGen Technologies",
      type: OpportunityType.JOB,
      location: "Bengaluru",
      applyLink: "https://example.com/software-job",
      deadline: new Date("2026-11-10"),
    },
    {
      title: "AI & Data Science Student Workshop",
      description:
        "Interactive technical workshop covering practical AI, data science workflows and industry applications.",
      company: "AI Student Network",
      type: OpportunityType.EVENT,
      location: "Online",
      applyLink: "https://example.com/ai-workshop",
      deadline: new Date("2026-09-30"),
    },
    {
      title: "Open Source Contribution Sprint",
      description:
        "Student-friendly open source event designed to help developers make their first meaningful contributions.",
      company: "Open Source Community",
      type: OpportunityType.EVENT,
      location: "Online",
      applyLink: "https://example.com/open-source",
      deadline: new Date("2026-10-20"),
    },
  ];

  for (const opportunity of opportunities) {
    const data = {
      title: opportunity.title,
      description: opportunity.description,
      company: opportunity.company,
      type: opportunity.type,
      location: opportunity.location,
      applyLink: opportunity.applyLink,
      deadline: opportunity.deadline,
      postedById: user.id,
      isActive: true,
      moderatedAt: new Date(),
      moderationCategories: [],
      moderationReasons: [],
      moderationScore: 0.99,
      moderationStatus: ModerationStatus.APPROVED,
      moderationSummary: "Demo opportunity approved for use.",
    };

    const existing = await prisma.opportunity.findFirst({
      where: {
        title: opportunity.title,
        postedById: user.id,
      },
    });

    if (existing) {
      await prisma.opportunity.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.opportunity.create({ data });
    }
  }

  console.log("💼 6 demo opportunities ready.");

  // =========================================================
  // 7. FINAL COUNTS
  // =========================================================

  const noteCount = await prisma.note.count();
  const pyqCount = await prisma.pYQ.count();
  const opportunityCount = await prisma.opportunity.count();
  const studentCount = await prisma.user.count();

  console.log("");
  console.log("======================================");
  console.log("🎉 ELARIS-ONE DEMO DATA READY");
  console.log("======================================");
  console.log(`Users:         ${studentCount}`);
  console.log(`Notes:         ${noteCount}`);
  console.log(`PYQs:          ${pyqCount}`);
  console.log(`Opportunities: ${opportunityCount}`);
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
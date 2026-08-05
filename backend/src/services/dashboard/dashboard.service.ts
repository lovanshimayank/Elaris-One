import { prisma } from "../../lib/prisma";

export const getDashboard = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      enrollmentNumber: true,
      role: true,
      branch: true,
      semester: true,
    },
  });

  const [
    notesCount,
    pyqCount,
    opportunityCount,
    studentCount,
    latestNotes,
    latestPYQs,
    latestOpportunities,
  ] = await Promise.all([
    prisma.note.count(),

    prisma.pYQ.count(),

    prisma.opportunity.count(),

    prisma.user.count(),

    prisma.note.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.pYQ.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.opportunity.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    user,

    stats: {
      notes: notesCount,
      pyqs: pyqCount,
      opportunities: opportunityCount,
      students: studentCount,
    },

    latestNotes,

    latestPYQs,

    latestOpportunities,
  };
};
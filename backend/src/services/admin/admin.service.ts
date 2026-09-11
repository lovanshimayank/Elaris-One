import { prisma } from "../../lib/prisma.js";
import { UserRole, ModerationStatus } from "@prisma/client";

export async function getAdminMetrics() {
  const [
    totalUsers,
    totalNotes,
    totalPYQs,
    totalOpportunities,
    pendingNotes,
    pendingPYQs,
    pendingOpportunities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count(),
    prisma.pYQ.count(),
    prisma.opportunity.count(),

    prisma.note.count({
      where: { moderationStatus: "PENDING" },
    }),

    prisma.pYQ.count({
      where: { moderationStatus: "PENDING" },
    }),

    prisma.opportunity.count({
      where: { moderationStatus: "PENDING" },
    }),
  ]);

  return {
    totalUsers,
    totalNotes,
    totalPYQs,
    totalOpportunities,

    pendingModerations:
      pendingNotes +
      pendingPYQs +
      pendingOpportunities,

    systemHealth: {
      status: "OPTIMAL",
      database: "CONNECTED",
      aiEngine: "ACTIVE",
      timestamp: new Date().toISOString(),
    },
  };
}

export async function getAllUsers(params: {
  search?: string;
  role?: UserRole;
}) {
  const { search, role } = params;

  return await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                enrollmentNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    select: {
      id: true,
      enrollmentNumber: true,
      fullName: true,
      email: true,
      role: true,
      branch: true,
      semester: true,
      college: true,
      isActive: true,
      isVerified: true,
      createdAt: true,

      _count: {
        select: {
          notes: true,
          pyqs: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function toggleUserStatus(
  userId: string,
  isActive: boolean
) {
  return await prisma.user.update({
    where: { id: userId },

    data: {
      isActive,
    },

    select: {
      id: true,
      fullName: true,
      isActive: true,
    },
  });
}

export async function updateUserRole(
  userId: string,
  role: UserRole
) {
  return await prisma.user.update({
    where: { id: userId },

    data: {
      role,
    },

    select: {
      id: true,
      fullName: true,
      role: true,
    },
  });
}

export async function getPendingModerations() {
  const [notes, pyqs, opportunities] =
    await Promise.all([
      prisma.note.findMany({
        where: {
          moderationStatus: "PENDING",
        },

        include: {
          subject: true,

          uploadedBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.pYQ.findMany({
        where: {
          moderationStatus: "PENDING",
        },

        include: {
          subject: true,

          uploadedBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.opportunity.findMany({
        where: {
          moderationStatus: "PENDING",
        },

        include: {
          postedBy: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  return {
    notes,
    pyqs,
    opportunities,
  };
}

export async function resolveModeration(params: {
  itemType: "note" | "pyq" | "opportunity";
  itemId: string;
  status: ModerationStatus;
  reasons?: string[];
  summary?: string;
}) {
  const {
    itemType,
    itemId,
    status,
    reasons,
    summary,
  } = params;

  if (itemType === "note") {
    return await prisma.note.update({
      where: {
        id: itemId,
      },

      data: {
        moderationStatus: status,
        isApproved: status === "APPROVED",
        isPublic: status === "APPROVED",
        moderatedAt: new Date(),

        moderationReasons:
          reasons || [],

        moderationSummary:
          summary ||
          `Admin moderation: ${status}`,
      },
    });
  }

  if (itemType === "pyq") {
    return await prisma.pYQ.update({
      where: {
        id: itemId,
      },

      data: {
        moderationStatus: status,
        moderatedAt: new Date(),

        moderationReasons:
          reasons || [],

        moderationSummary:
          summary ||
          `Admin moderation: ${status}`,
      },
    });
  }

  return await prisma.opportunity.update({
    where: {
      id: itemId,
    },

    data: {
      moderationStatus: status,
      isActive: status === "APPROVED",
      moderatedAt: new Date(),

      moderationReasons:
        reasons || [],

      moderationSummary:
        summary ||
        `Admin moderation: ${status}`,
    },
  });
}

import { prisma } from "../../lib/prisma.js";
import { UserRole, ModerationStatus } from "@prisma/client";
import { createNotification } from "../notifications/notification.service.js";

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
    const note = await prisma.note.update({
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

    if (status === "APPROVED" || status === "REJECTED") {
      await createNotification({
        userId: note.uploadedById,
        title:
          status === "APPROVED"
            ? "Note Approved"
            : "Note Rejected",
        message:
          status === "APPROVED"
            ? `Your note "${note.title}" has been approved and is now available to students.`
            : `Your note "${note.title}" was rejected during moderation.`,
        type:
          status === "APPROVED"
            ? "APPROVED"
            : "REJECTED",
        link: "/notes",
      });
    }

    return note;
  }

  if (itemType === "pyq") {
    const pyq = await prisma.pYQ.update({
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

    if (status === "APPROVED" || status === "REJECTED") {
      await createNotification({
        userId: pyq.uploadedById,
        title:
          status === "APPROVED"
            ? "PYQ Approved"
            : "PYQ Rejected",
        message:
          status === "APPROVED"
            ? `Your PYQ "${pyq.title}" has been approved and is now available to students.`
            : `Your PYQ "${pyq.title}" was rejected during moderation.`,
        type:
          status === "APPROVED"
            ? "APPROVED"
            : "REJECTED",
        link: "/pyqs",
      });
    }

    return pyq;
  }

  const opportunity = await prisma.opportunity.update({
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

  if (status === "APPROVED" || status === "REJECTED") {
    await createNotification({
      userId: opportunity.postedById,
      title:
        status === "APPROVED"
          ? "Opportunity Approved"
          : "Opportunity Rejected",
      message:
        status === "APPROVED"
          ? `Your opportunity "${opportunity.title}" has been approved and is now visible to students.`
          : `Your opportunity "${opportunity.title}" was rejected during moderation.`,
      type:
        status === "APPROVED"
          ? "APPROVED"
          : "REJECTED",
      link: "/opportunities",
    });
  }

  return opportunity;
}

/**
 * Delete a physical uploaded file associated with a Note/PYQ.
 * Expected URL format:
 * /downloads/notes/<filename>
 * /downloads/pyqs/<filename>
 */
async function deletePhysicalFile(fileUrl: string) {
  try {
    const url = new URL(fileUrl, "http://localhost");
    const pathname = url.pathname;

    const match = pathname.match(
      /^\/downloads\/(notes|pyqs)\/([^/]+)$/
    );

    if (!match) {
      return;
    }

    const folder = match[1];
    const filename = decodeURIComponent(match[2]);

    const fs = await import("fs/promises");
    const path = await import("path");

    const filePath = path.join(
      process.cwd(),
      "uploads",
      folder,
      filename
    );

    await fs.unlink(filePath);
  } catch (error: any) {
    // File may already be missing.
    // Database deletion should still succeed.
    if (error?.code !== "ENOENT") {
      console.error(
        "Failed to delete physical file:",
        error
      );
    }
  }
}

export async function deleteNoteByAdmin(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      pdfUrl: true,
    },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  await prisma.note.delete({
    where: { id },
  });

  await deletePhysicalFile(note.pdfUrl);

  return {
    id: note.id,
    title: note.title,
  };
}

export async function deletePYQByAdmin(id: string) {
  const pyq = await prisma.pYQ.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      pdfUrl: true,
    },
  });

  if (!pyq) {
    throw new Error("PYQ not found");
  }

  await prisma.pYQ.delete({
    where: { id },
  });

  await deletePhysicalFile(pyq.pdfUrl);

  return {
    id: pyq.id,
    title: pyq.title,
  };
}

export async function deleteOpportunityByAdmin(id: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
    },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  await prisma.opportunity.delete({
    where: { id },
  });

  return {
    id: opportunity.id,
    title: opportunity.title,
  };
}
// ============================================================
// ADMIN CONTENT MANAGEMENT
// ============================================================

export async function getAllAdminContent() {
  const [notes, pyqs, opportunities] = await Promise.all([
    prisma.note.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
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
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
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
      include: {
        postedBy: {
          select: {
            id: true,
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

export async function bulkDeleteNotes(ids: string[]) {
  if (!ids.length) {
    throw new Error("No notes selected");
  }

  const deleted: Array<{
    id: string;
    title: string;
  }> = [];

  for (const id of ids) {
    try {
      const result = await deleteNoteByAdmin(id);
      deleted.push(result);
    } catch (error: any) {
      console.error(`Failed to delete note ${id}:`, error.message);
    }
  }

  return {
    deleted,
    requested: ids.length,
    deletedCount: deleted.length,
  };
}

export async function bulkDeletePYQs(ids: string[]) {
  if (!ids.length) {
    throw new Error("No PYQs selected");
  }

  const deleted: Array<{
    id: string;
    title: string;
  }> = [];

  for (const id of ids) {
    try {
      const result = await deletePYQByAdmin(id);
      deleted.push(result);
    } catch (error: any) {
      console.error(`Failed to delete PYQ ${id}:`, error.message);
    }
  }

  return {
    deleted,
    requested: ids.length,
    deletedCount: deleted.length,
  };
}

export async function bulkDeleteOpportunities(ids: string[]) {
  if (!ids.length) {
    throw new Error("No opportunities selected");
  }

  const deleted: Array<{
    id: string;
    title: string;
  }> = [];

  for (const id of ids) {
    try {
      const result = await deleteOpportunityByAdmin(id);
      deleted.push(result);
    } catch (error: any) {
      console.error(
        `Failed to delete opportunity ${id}:`,
        error.message
      );
    }
  }

  return {
    deleted,
    requested: ids.length,
    deletedCount: deleted.length,
  };
}

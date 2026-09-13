import { prisma } from "../../lib/prisma.js";
import { UserRole, ModerationStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

export async function getAdminMetrics() {
  const [
    totalUsers,
    totalNotes,
    totalPYQs,
    totalOpportunities,
    totalQuizzes,
    totalDecks,
    pendingNotes,
    pendingPYQs,
    pendingOpportunities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count(),
    prisma.pYQ.count(),
    prisma.opportunity.count(),
    prisma.quiz.count(),
    prisma.flashcardDeck.count(),
    prisma.note.count({ where: { moderationStatus: "PENDING" } }),
    prisma.pYQ.count({ where: { moderationStatus: "PENDING" } }),
    prisma.opportunity.count({where: {moderationStatus: "PENDING",},}),
  ]);

  return {
    totalUsers,
    totalNotes,
    totalPYQs,
    totalOpportunities,
    totalQuizzes,
    totalDecks,
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

export async function getAllUsers(params: { search?: string; role?: UserRole }) {
  const { search, role } = params;
  return await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { enrollmentNumber: { contains: search, mode: "insensitive" } },
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
          assignments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, fullName: true, isActive: true },
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, fullName: true, role: true },
  });
}

export async function getPendingModerations() {
  const [notes, pyqs, opportunities] = await Promise.all([
    prisma.note.findMany({
      where: { moderationStatus: "PENDING" },
      include: {
        subject: true,
        uploadedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.pYQ.findMany({
      where: { moderationStatus: "PENDING" },
      include: {
        subject: true,
        uploadedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.opportunity.findMany({
      where: { moderationStatus: "PENDING" },
      include: {
        postedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
      where: { id: itemId },
      data: {
        moderationStatus: status,
        isApproved: status === "APPROVED",
        isPublic: status === "APPROVED",
        moderatedAt: new Date(),
        moderationReasons: reasons || [],
        moderationSummary:
          summary || `Admin moderation: ${status}`,
      },
    });
  }

  if (itemType === "pyq") {
    return await prisma.pYQ.update({
      where: { id: itemId },
      data: {
        moderationStatus: status,
        moderatedAt: new Date(),
        moderationReasons: reasons || [],
        moderationSummary:
          summary || `Admin moderation: ${status}`,
      },
    });
  }

  return await prisma.opportunity.update({
    where: { id: itemId },
    data: {
      moderationStatus: status,
      isActive: status === "APPROVED",
      moderatedAt: new Date(),
      moderationReasons: reasons || [],
      moderationSummary:
        summary || `Admin moderation: ${status}`,
    },
  });

}


const deletePhysicalFile = (fileUrl?: string | null) => {
  if (!fileUrl) return;

  try {
    /*
     * Expected URL:
     * /api/v1/downloads/notes/filename.pdf
     *
     * We only extract the upload folder + filename.
     */
    const match = fileUrl.match(
      /\/downloads\/([^/]+)\/([^/]+)$/
    );

    if (!match) {
      console.warn(
        "Could not resolve physical upload path:",
        fileUrl
      );
      return;
    }

    const [, folder, filename] = match;

    const filePath = path.join(
      process.cwd(),
      "uploads",
      folder,
      filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Deleted physical file:", filePath);
    } else {
      console.warn(
        "Physical file not found:",
        filePath
      );
    }
  } catch (error) {
    console.error(
      "Failed to delete physical file:",
      error
    );
  }
};

export const deleteNoteByAdmin = async (
  id: string
) => {
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

  /*
   * Delete database record first.
   */
  const deletedNote = await prisma.note.delete({
    where: { id },
  });

  /*
   * Then remove the physical uploaded file.
   */
  deletePhysicalFile(note.pdfUrl);

  return deletedNote;
};

export const deletePYQByAdmin = async (
  id: string
) => {
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

  const deletedPYQ = await prisma.pYQ.delete({
    where: { id },
  });

  deletePhysicalFile(pyq.pdfUrl);

  return deletedPYQ;
};

export const deleteOpportunityByAdmin = async (
  id: string
) => {
  const opportunity =
    await prisma.opportunity.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  return prisma.opportunity.delete({
    where: { id },
  });
};
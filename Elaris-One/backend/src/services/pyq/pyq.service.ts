import { prisma } from "../../lib/prisma";
import { moderateContent } from "../ai/content-moderation.service";

interface CreatePYQData {
  title: string;
  subjectId: string;
  semester: number;
  branch: string;
  year: number;
  pdfUrl: string;
}

interface UpdatePYQData {
  title?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
  year?: number;
  pdfUrl?: string;
}

export const createPYQ = async (
  userId: string,
  data: CreatePYQData
) => {
  console.log("========== PYQ CREATION ==========");
  console.log("Incoming PYQ:", data);

  if (!data.title?.trim()) {
    throw new Error("PYQ title is required");
  }

  if (!data.subjectId) {
    throw new Error("Subject is required");
  }

  if (!data.semester) {
    throw new Error("Semester is required");
  }

  if (!data.branch?.trim()) {
    throw new Error("Branch is required");
  }

  if (!data.year) {
    throw new Error("Year is required");
  }

  if (!data.pdfUrl?.trim()) {
    throw new Error("PDF URL is required");
  }

  /*
   * Content sent to Elaris AI moderation.
   */
  const moderationContent = `
Title: ${data.title}

Academic Information:
Semester: ${data.semester}
Branch: ${data.branch}
Year: ${data.year}

This is a previous-year university examination question paper.
`;

  /*
   * AI CONTENT MODERATION
   */
  const moderation = await moderateContent({
    title: data.title,
    contentType: "PYQ",
    content: moderationContent,
  });

  console.log("AI PYQ Moderation Result:", moderation);

  let moderationStatus:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  let isPublic = false;

  if (moderation.status === "SAFE") {
    moderationStatus = "APPROVED";
    isPublic = true;
  } else if (moderation.status === "UNSAFE") {
    moderationStatus = "REJECTED";
  } else {
    moderationStatus = "PENDING";
  }

  const pyq = await prisma.pYQ.create({
    data: {
      title: data.title,
      semester: data.semester,
      branch: data.branch,
      year: data.year,
      pdfUrl: data.pdfUrl,

      moderationStatus,
      moderationScore: moderation.score,
      moderationReasons: moderation.reasons,
      moderationCategories: moderation.categories,
      moderationSummary: moderation.summary,
      moderatedAt: new Date(),

      subject: {
        connect: {
          id: data.subjectId,
        },
      },

      uploadedBy: {
        connect: {
          id: userId,
        },
      },
    },

    include: {
      subject: true,

      uploadedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  console.log(
    `PYQ created with moderation status: ${moderationStatus}`
  );

  return pyq;
};

export const getAllPYQs = async () => {
  return prisma.pYQ.findMany({
    include: {
      subject: true,

      uploadedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPYQById = async (
  id: string
) => {
  return prisma.pYQ.findUnique({
    where: {
      id,
    },

    include: {
      subject: true,

      uploadedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
};

export const updatePYQ = async (
  id: string,
  data: UpdatePYQData
) => {
  return prisma.pYQ.update({
    where: {
      id,
    },

    data,
  });
};

export const deletePYQ = async (
  id: string
) => {
  return prisma.pYQ.delete({
    where: {
      id,
    },
  });
};
import { prisma } from "../../lib/prisma";
import { moderateContent } from "../ai/content-moderation.service";

interface CreateNoteData {
  title: string;
  description?: string;
  subjectId: string;
  semester: number;
  branch: string;
  pdfUrl: string;
}

interface UpdateNoteData {
  title?: string;
  description?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
  pdfUrl?: string;
}

const runNoteModeration = async (data: {
  title: string;
  description?: string;
  semester: number;
  branch: string;
}) => {
  const moderationContent = `
Title: ${data.title}

Description:
${data.description || "No description provided."}

Academic Information:
Semester: ${data.semester}
Branch: ${data.branch}
`;

  return moderateContent({
    title: data.title,
    contentType: "NOTE",
    content: moderationContent,
  });
};

const mapModerationResult = (
  status: "SAFE" | "UNSAFE" | "REVIEW"
) => {
  if (status === "SAFE") {
    return {
      moderationStatus: "APPROVED" as const,
      isApproved: true,
      isPublic: true,
    };
  }

  if (status === "UNSAFE") {
    return {
      moderationStatus: "REJECTED" as const,
      isApproved: false,
      isPublic: false,
    };
  }

  return {
    moderationStatus: "PENDING" as const,
    isApproved: false,
    isPublic: false,
  };
};

export const createNote = async (
  userId: string,
  data: CreateNoteData
) => {
  console.log("========== NOTE CREATION ==========");
  console.log("Incoming Note:", data);

  if (!data.title?.trim()) {
    throw new Error("Note title is required");
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

  if (!data.pdfUrl?.trim()) {
    throw new Error("PDF URL is required");
  }

  const moderation = await runNoteModeration({
    title: data.title,
    description: data.description,
    semester: data.semester,
    branch: data.branch,
  });

  console.log("AI Moderation Result:", moderation);

  const publication = mapModerationResult(
    moderation.status
  );

  const note = await prisma.note.create({
    data: {
      title: data.title,
      description: data.description,
      semester: data.semester,
      branch: data.branch,
      pdfUrl: data.pdfUrl,

      isApproved: publication.isApproved,
      isPublic: publication.isPublic,

      moderationStatus: publication.moderationStatus,
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
    `Note created with moderation status: ${publication.moderationStatus}`
  );

  return note;
};

export const getAllNotes = async (filters?: {
  search?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
}) => {
  const where: any = {
    isPublic: true,
    moderationStatus: "APPROVED",
  };

  if (filters?.subjectId) {
    where.subjectId = filters.subjectId;
  }

  if (filters?.semester) {
    where.semester = filters.semester;
  }

  if (filters?.branch) {
    where.branch = filters.branch;
  }

  if (filters?.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return prisma.note.findMany({
    where,

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

export const getNoteById = async (id: string) => {
  return prisma.note.findUnique({
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

export const updateNote = async (
  id: string,
  data: UpdateNoteData
) => {
  const existingNote = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  if (!existingNote) {
    throw new Error("Note not found");
  }

  const updatedContent = {
    title: data.title ?? existingNote.title,
    description:
      data.description ?? existingNote.description ?? undefined,
    semester: data.semester ?? existingNote.semester,
    branch: data.branch ?? existingNote.branch,
  };

  const moderation = await runNoteModeration(
    updatedContent
  );

  console.log(
    "AI Moderation Result after Note update:",
    moderation
  );

  const publication = mapModerationResult(
    moderation.status
  );

  return prisma.note.update({
    where: {
      id,
    },

    data: {
      ...data,

      isApproved: publication.isApproved,
      isPublic: publication.isPublic,

      moderationStatus: publication.moderationStatus,
      moderationScore: moderation.score,
      moderationReasons: moderation.reasons,
      moderationCategories: moderation.categories,
      moderationSummary: moderation.summary,
      moderatedAt: new Date(),
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

export const deleteNote = async (id: string) => {
  return prisma.note.delete({
    where: {
      id,
    },
  });
};
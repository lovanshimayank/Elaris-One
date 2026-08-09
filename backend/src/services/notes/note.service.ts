import { prisma } from "../../lib/prisma";

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
  isApproved?: boolean;
  isPublic?: boolean;
}

export const createNote = async (
  userId: string,
  data: CreateNoteData
) => {
  console.log("Incoming Note:", data);

  return prisma.note.create({
    data: {
      title: data.title,
      description: data.description,
      semester: data.semester,
      branch: data.branch,
      pdfUrl: data.pdfUrl,

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
};

export const getAllNotes = async (filters?: {
  search?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
}) => {
  const where: any = {
    isPublic: true,
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
  return prisma.note.update({
    where: {
      id,
    },

    data,
  });
};

export const deleteNote = async (id: string) => {
  return prisma.note.delete({
    where: {
      id,
    },
  });
};
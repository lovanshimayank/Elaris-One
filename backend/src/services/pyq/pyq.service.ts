import { prisma } from "../../lib/prisma";

export const createPYQ = async (
  userId: string,
  data: any
) => {
  console.log("Incoming PYQ Data:", data);

  return prisma.pYQ.create({
    data: {
      title: data.title,
      semester: data.semester,
      branch: data.branch,
      year: data.year,
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
  data: any
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

import { prisma } from "../../lib/prisma";

export const addBookmark = async (
  userId: string,
  data: any
) => {
  return prisma.bookmark.create({
    data: {
      userId,
      noteId: data.noteId,
      pyqId: data.pyqId,
      opportunityId: data.opportunityId,
    },
  });
};

export const getBookmarks = async (
  userId: string
) => {
  return prisma.bookmark.findMany({
    where: {
      userId,
    },
    include: {
      note: true,
      pyq: true,
      opportunity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const removeBookmark = async (
  id: string,
  userId: string
) => {
  return prisma.bookmark.deleteMany({
    where: {
      id,
      userId,
    },
  });
};
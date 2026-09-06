import { prisma } from "../../lib/prisma";

export const addBookmark = async (
  userId: string,
  data: any
) => {

  const existing = await prisma.bookmark.findFirst({
    where: {
      userId,
      noteId: data.noteId ?? null,
      pyqId: data.pyqId ?? null,
      opportunityId: data.opportunityId ?? null,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.bookmark.create({
    data: {
      userId,
      noteId: data.noteId ?? null,
      pyqId: data.pyqId ?? null,
      opportunityId: data.opportunityId ?? null,
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
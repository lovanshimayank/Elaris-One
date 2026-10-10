import { ReadingResourceType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getPdfPageCount } from "./pdf-extraction.service";

export type ResourceType = "NOTE" | "PYQ";

export interface ReadingUser {
  id: string;
  role: string;
}

export interface ReadingResource {
  id: string;
  title: string;
  pdfUrl: string;
  subjectId: string;
  resourceType: ResourceType;
}

export const getReadableResource = async (
  type: ResourceType,
  resourceId: string,
  user: ReadingUser
): Promise<ReadingResource> => {
  if (type === "NOTE") {
    const note = await prisma.note.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
        pdfUrl: true,
        subjectId: true,
        uploadedById: true,
        isPublic: true,
        isApproved: true,
        moderationStatus: true,
      },
    });

    if (!note) {
      throw new Error("Note not found.");
    }

    const isOwner = note.uploadedById === user.id;
    const isAdmin = user.role === "ADMIN";
    const isPublicApproved =
      note.isPublic &&
      note.isApproved &&
      note.moderationStatus === "APPROVED";

    if (!isOwner && !isAdmin && !isPublicApproved) {
      throw new Error("You do not have permission to read this note.");
    }

    return {
      id: note.id,
      title: note.title,
      pdfUrl: note.pdfUrl,
      subjectId: note.subjectId,
      resourceType: type,
    };
  }

  const pyq = await prisma.pYQ.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      title: true,
      pdfUrl: true,
      subjectId: true,
      uploadedById: true,
      moderationStatus: true,
    },
  });

  if (!pyq) {
    throw new Error("PYQ not found.");
  }

  const isOwner = pyq.uploadedById === user.id;
  const isAdmin = user.role === "ADMIN";
  const isPublicApproved = pyq.moderationStatus === "APPROVED";

  if (!isOwner && !isAdmin && !isPublicApproved) {
    throw new Error("You do not have permission to read this PYQ.");
  }

  return {
    id: pyq.id,
    title: pyq.title,
    pdfUrl: pyq.pdfUrl,
    subjectId: pyq.subjectId,
    resourceType: type,
  };
};

const ensureProgress = async (
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  totalPages: number
) => {
  const existing = await prisma.readingProgress.findUnique({
    where: {
      userId_resourceType_resourceId: {
        userId,
        resourceType,
        resourceId,
      },
    },
  });

  if (existing && existing.totalPages !== totalPages) {
    await prisma.readingProgress.update({
      where: { id: existing.id },
      data: { totalPages, completedAt: null },
    });
  }

  return prisma.readingProgress.upsert({
    where: {
      userId_resourceType_resourceId: {
        userId,
        resourceType,
        resourceId,
      },
    },
    create: {
      userId,
      resourceType,
      resourceId,
      totalPages,
    },
    update: { totalPages },
  });
};

export const getReadingState = async (
  type: ResourceType,
  resourceId: string,
  user: ReadingUser
) => {
  const resource = await getReadableResource(type, resourceId, user);
  const totalPages = await getPdfPageCount(resource.pdfUrl);

  const progress = await ensureProgress(
    user.id,
    type,
    resourceId,
    totalPages
  );

  const visitedPages = await prisma.readingPageProgress.findMany({
    where: { progressId: progress.id },
    select: { pageNumber: true },
    orderBy: { pageNumber: "asc" },
  });

  return {
    resource,
    totalPages,
    lastPage: progress.lastPage,
    completed: progress.completedAt !== null,
    completedAt: progress.completedAt,
    visitedPages: visitedPages.map((page) => page.pageNumber),
  };
};

export const recordPageVisit = async (
  type: ResourceType,
  resourceId: string,
  pageNumber: number,
  user: ReadingUser
) => {
  const resource = await getReadableResource(type, resourceId, user);
  const totalPages = await getPdfPageCount(resource.pdfUrl);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > totalPages
  ) {
    throw new Error("Invalid page number.");
  }

  const progress = await ensureProgress(
    user.id,
    type,
    resourceId,
    totalPages
  );

  await prisma.readingPageProgress.upsert({
    where: {
      progressId_pageNumber: {
        progressId: progress.id,
        pageNumber,
      },
    },
    create: {
      progressId: progress.id,
      pageNumber,
    },
    update: {},
  });

  const visitedCount = await prisma.readingPageProgress.count({
    where: { progressId: progress.id },
  });

  const completed = visitedCount >= totalPages;

  const updatedProgress = await prisma.readingProgress.update({
    where: { id: progress.id },
    data: {
      lastPage: Math.max(progress.lastPage, pageNumber),
      ...(completed && !progress.completedAt
        ? { completedAt: new Date() }
        : {}),
    },
  });

  return {
    pageNumber,
    totalPages,
    visitedCount,
    completed: updatedProgress.completedAt !== null,
  };
};


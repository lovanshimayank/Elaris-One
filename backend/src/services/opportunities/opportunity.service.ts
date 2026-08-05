import { prisma } from "../../lib/prisma";

export const createOpportunity = async (
  userId: string,
  data: any
) => {
  return prisma.opportunity.create({
    data: {
      ...data,
      postedById: userId,
    },
  });
};

export const getAllOpportunities = async () => {
  return prisma.opportunity.findMany({
    include: {
      postedBy: {
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOpportunityById = async (
  id: string
) => {
  return prisma.opportunity.findUnique({
    where: {
      id,
    },
    include: {
      postedBy: {
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
        },
      },
    },
  });
};

export const updateOpportunity = async (
  id: string,
  data: any
) => {
  return prisma.opportunity.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteOpportunity = async (
  id: string
) => {
  return prisma.opportunity.delete({
    where: {
      id,
    },
  });
};

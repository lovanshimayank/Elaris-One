import { prisma } from "../../lib/prisma";
import { moderateContent } from "../ai/content-moderation.service";

interface CreateOpportunityData {
  title: string;
  description: string;
  company?: string;
  location?: string;
  type: any;
  applyLink?: string;
  deadline?: string;
}

interface UpdateOpportunityData {
  title?: string;
  description?: string;
  company?: string;
  location?: string;
  type?: any;
  applyLink?: string;
  deadline?: string;
  isActive?: boolean;
}

export const createOpportunity = async (
  userId: string,
  data: CreateOpportunityData
) => {
  console.log("========== OPPORTUNITY CREATION ==========");
  console.log("Incoming Opportunity:", data);

  if (!data.title?.trim()) {
    throw new Error("Opportunity title is required");
  }

  if (!data.description?.trim()) {
    throw new Error("Opportunity description is required");
  }

  const moderation = await moderateContent({
    title: data.title,
    contentType: "OPPORTUNITY",
    content: `
Title: ${data.title}

Description:
${data.description}

Company:
${data.company || "Not specified"}

Location:
${data.location || "Not specified"}

Opportunity Type:
${data.type || "Not specified"}

Apply Link:
${data.applyLink || "Not specified"}
`,
  });

  console.log(
    "AI Opportunity Moderation Result:",
    moderation
  );

  let moderationStatus:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  let isActive = false;

  if (moderation.status === "SAFE") {
    moderationStatus = "APPROVED";
    isActive = true;
  } else if (moderation.status === "UNSAFE") {
    moderationStatus = "REJECTED";
  } else {
    moderationStatus = "PENDING";
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      type: data.type,
      applyLink: data.applyLink,
      deadline: data.deadline
        ? new Date(data.deadline)
        : undefined,

      isActive,

      moderationStatus,
      moderationScore: moderation.score,
      moderationReasons: moderation.reasons,
      moderationCategories: moderation.categories,
      moderationSummary: moderation.summary,
      moderatedAt: new Date(),

      postedBy: {
        connect: {
          id: userId,
        },
      },
    },

    include: {
      postedBy: {
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
          role: true,
        },
      },
    },
  });

  console.log(
    `Opportunity created with moderation status: ${moderationStatus}`
  );

  return opportunity;
};

export const getAllOpportunities = async () => {
  return prisma.opportunity.findMany({
    include: {
      postedBy: {
        select: {
          id: true,
          fullName: true,
          enrollmentNumber: true,
          role: true,
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
          role: true,
        },
      },
    },
  });
};

export const updateOpportunity = async (
  id: string,
  data: UpdateOpportunityData
) => {
  return prisma.opportunity.update({
    where: {
      id,
    },

    data: {
      ...data,
      deadline: data.deadline
        ? new Date(data.deadline)
        : undefined,
    },
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
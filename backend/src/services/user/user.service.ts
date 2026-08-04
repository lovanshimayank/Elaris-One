import { prisma } from "../../lib/prisma";

export const getMyProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      enrollmentNumber: true,
      fullName: true,
      email: true,
      phone: true,
      college: true,
      branch: true,
      year: true,
      semester: true,
      section: true,
      github: true,
      linkedin: true,
      bio: true,
      skills: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateMyProfile = async (
  userId: string,
  data: any
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: {
      id: true,
      enrollmentNumber: true,
      fullName: true,
      email: true,
      phone: true,
      college: true,
      branch: true,
      year: true,
      semester: true,
      section: true,
      github: true,
      linkedin: true,
      bio: true,
      skills: true,
      role: true,
    },
  });
};
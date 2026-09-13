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
      profileImage: true,
      departmentId: true,
      createdAt: true,
    },
  });
};

export const updateMyProfile = async (
  userId: string,
  data: {
    fullName?: string;
    phone?: string | null;
    college?: string | null;
    branch?: string | null;
    year?: number | null;
    semester?: number | null;
    section?: string | null;
    github?: string | null;
    linkedin?: string | null;
    bio?: string | null;
    skills?: string[];
    profileImage?: string | null;
  }
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...(data.fullName !== undefined && {
        fullName: data.fullName,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.college !== undefined && {
        college: data.college,
      }),

      ...(data.branch !== undefined && {
        branch: data.branch,
      }),

      ...(data.year !== undefined && {
        year: data.year,
      }),

      ...(data.semester !== undefined && {
        semester: data.semester,
      }),

      ...(data.section !== undefined && {
        section: data.section,
      }),

      ...(data.github !== undefined && {
        github: data.github,
      }),

      ...(data.linkedin !== undefined && {
        linkedin: data.linkedin,
      }),

      ...(data.bio !== undefined && {
        bio: data.bio,
      }),

      ...(data.skills !== undefined && {
        skills: data.skills,
      }),

      ...(data.profileImage !== undefined && {
        profileImage: data.profileImage,
      }),
    },

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
      profileImage: true,
      departmentId: true,
      createdAt: true,
    },
  });
};
import { prisma } from "../../lib/prisma";

export const getSubjects = async () => {
  return prisma.subject.findMany({
    include: {
      department: true,
    },
    orderBy: {
      semester: "asc",
    },
  });
};

export const createSubject = async (data: any) => {
  return prisma.subject.create({
    data,
  });
};
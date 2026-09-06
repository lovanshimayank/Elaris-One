import { prisma } from "../../lib/prisma";

export const getDepartments = async () => {
  return prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const createDepartment = async (data: {
  name: string;
  code: string;
  type: any;
}) => {
  return prisma.department.create({
    data,
  });
};
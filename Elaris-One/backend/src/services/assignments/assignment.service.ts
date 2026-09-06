import { prisma } from "../../lib/prisma.js";
import { AssignmentPriority, AssignmentStatus } from "@prisma/client";

export async function createAssignment(userId: string, data: {
  title: string;
  description?: string;
  subjectId?: string;
  dueDate: string | Date;
  priority?: AssignmentPriority;
}) {
  return await prisma.assignment.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      subjectId: data.subjectId,
      dueDate: new Date(data.dueDate),
      priority: data.priority || "MEDIUM",
      status: "PENDING",
    },
    include: { subject: true },
  });
}

export async function getUserAssignments(userId: string, status?: AssignmentStatus) {
  return await prisma.assignment.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: { subject: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function updateAssignment(assignmentId: string, userId: string, data: {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  priority?: AssignmentPriority;
  status?: AssignmentStatus;
}) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) {
    throw new Error("Assignment not found or unauthorized");
  }

  return await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.status ? { status: data.status } : {}),
    },
    include: { subject: true },
  });
}

export async function deleteAssignment(assignmentId: string, userId: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) {
    throw new Error("Assignment not found or unauthorized");
  }

  await prisma.assignment.delete({ where: { id: assignmentId } });
  return true;
}
import { prisma } from "../../lib/prisma";

export const globalSearch = async (
  keyword: string
) => {
  const notes = await prisma.note.findMany({
    where: {
      OR: [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          subject: {
            name: {
              contains: keyword,
              mode: "insensitive"
            }
          },
        },
      ],
    },
    take: 10,
  });

  const pyqs = await prisma.pYQ.findMany({
    where: {
      OR: [
        {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          subject: {
            name: {
              contains: keyword,
              mode: "insensitive"
            }
          },
        },
      ],
    },
    take: 10,
  });

  const opportunities =
    await prisma.opportunity.findMany({
      where: {
        OR: [
          {
            title: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            company: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 10,
    });

  return {
    notes,
    pyqs,
    opportunities,
  };
};
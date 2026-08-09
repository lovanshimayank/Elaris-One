import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  generateAIResponse,
} from "../../services/ai/gemini.service.js";

export const chatWithAI = async (
  req: Request,
  res: Response
) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userId = req.user?.id;

    let context: any = {
      user: undefined,
      notes: [],
      pyqs: [],
      opportunities: [],
    };

    if (userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          fullName: true,
          email: true,
          role: true,
          semester: true,
          branch: true,
        },
      });

      context.user = user;

      const [notes, pyqs, opportunities] =
        await Promise.all([
          prisma.note.findMany({
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
            include: {
              subject: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          }),

          prisma.pYQ.findMany({
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
          }),

          prisma.opportunity.findMany({
            where: {
              isActive: true,
            },
            take: 20,
            orderBy: {
              createdAt: "desc",
            },
          }),
        ]);

      context.notes = notes;
      context.pyqs = pyqs;
      context.opportunities = opportunities;
    }

    console.log("========== AI CAMPUS CONTEXT ==========");
console.log("User:", context.user);
console.log("Notes:", context.notes.length);
console.log("PYQs:", context.pyqs.length);
console.log("Opportunities:", context.opportunities.length);
console.log("=======================================");

    const response = await generateAIResponse(
      message,
      context
    );

    return res.status(200).json({
      success: true,
      data: {
        reply: response,
      },
    });
  } catch (error) {
    console.error("AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};
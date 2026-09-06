import { prisma } from "../../lib/prisma.js";
import { generateFlashcardsWithAI } from "../ai/ai-service-client.js";

export async function createDeck(userId: string, data: {
  title: string;
  description?: string;
  subjectId?: string;
  noteId?: string;
  cards: Array<{ question: string; answer: string; explanation?: string }>;
}) {
  return await prisma.flashcardDeck.create({
    data: {
      title: data.title,
      description: data.description,
      subjectId: data.subjectId,
      noteId: data.noteId,
      createdById: userId,
      cards: {
        create: data.cards.map((c, i) => ({
          question: c.question,
          answer: c.answer,
          explanation: c.explanation,
          order: i,
        })),
      },
    },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
      subject: true,
      note: true,
    },
  });
}

export async function getAllDecks(userId?: string, subjectId?: string) {
  return await prisma.flashcardDeck.findMany({
    where: {
      ...(subjectId ? { subjectId } : {}),
    },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
      subject: true,
      createdBy: {
        select: { id: true, fullName: true },
      },
      _count: {
        select: { cards: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeckById(deckId: string) {
  return await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        orderBy: { order: "asc" },
      },
      subject: true,
      note: true,
      createdBy: {
        select: { id: true, fullName: true },
      },
    },
  });
}

export async function generateDeckWithAI(userId: string, params: {
  topic: string;
  subjectId?: string;
  noteId?: string;
  count?: number;
}) {
  let noteText: string | undefined;
  if (params.noteId) {
    const note = await prisma.note.findUnique({
      where: { id: params.noteId },
      include: { summary: true },
    });
    if (note) {
      noteText = `${note.title}\n${note.description || ""}\n${note.summary?.summary || ""}`;
    }
  }

  const generatedCards = await generateFlashcardsWithAI({
    topic: params.topic,
    count: params.count || 6,
    text: noteText,
  });

  return await createDeck(userId, {
    title: `${params.topic} Flashcards`,
    description: `AI-generated active recall deck for ${params.topic}`,
    subjectId: params.subjectId,
    noteId: params.noteId,
    cards: generatedCards,
  });
}

export async function deleteDeck(deckId: string, userId: string, isAdmin = false) {
  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck) throw new Error("Flashcard deck not found");
  if (deck.createdById !== userId && !isAdmin) {
    throw new Error("Unauthorized to delete this deck");
  }

  await prisma.flashcardDeck.delete({ where: { id: deckId } });
  return true;
}
import { randomUUID } from "node:crypto";
import { QuizType, ReadingResourceType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { generateQuizStrictWithAI } from "../ai/ai-service-client.js";
import { extractPdfPages } from "./pdf-extraction.service.js";
import {
  getReadableResource,
  type ResourceType,
  type ReadingUser,
} from "./reading.service.js";

const PAGES_PER_CHUNK = 5;

export async function getOrCreateReadingQuiz(
  type: ResourceType,
  resourceId: string,
  startPage: number,
  user: ReadingUser,
) {
  const resource = await getReadableResource(type, resourceId, user);
  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_resourceType_resourceId: {
        userId: user.id,
        resourceType: type as ReadingResourceType,
        resourceId,
      },
    },
    include: { pages: { select: { pageNumber: true } } },
  });

  if (!progress) throw new Error("Start reading this PDF before requesting a quiz.");

  const isFinal = startPage === 0;
  if (!Number.isInteger(startPage) || (!isFinal && startPage < 1)) {
    throw new Error("Invalid quiz starting page.");
  }

  const totalPages = progress.totalPages;
  const chunkStart = isFinal ? 1 : startPage;
  const chunkEnd = isFinal
    ? totalPages
    : Math.min(chunkStart + PAGES_PER_CHUNK - 1, totalPages);

  if (!isFinal && (
    chunkStart > totalPages ||
    (chunkStart - 1) % PAGES_PER_CHUNK !== 0
  )) {
    throw new Error("Invalid quiz chunk.");
  }

  const visited = new Set(progress.pages.map((page) => page.pageNumber));
  for (let page = chunkStart; page <= chunkEnd; page++) {
    if (!visited.has(page)) {
      throw new Error(
        isFinal
          ? "Read every page before taking the final assessment."
          : `Read pages ${chunkStart}-${chunkEnd} before taking this quiz.`,
      );
    }
  }

  const idempotencyKey =
    `reading:${type}:${resourceId}:${isFinal ? "final" : `chunk:${chunkStart}-${chunkEnd}`}`;

  const existing = await prisma.quiz.findUnique({
    where: { idempotencyKey },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;

  const extracted = await extractPdfPages(
    resource.pdfUrl,
    Array.from({ length: chunkEnd - chunkStart + 1 }, (_, i) => chunkStart + i),
  );

  const generated = await generateQuizStrictWithAI({
    topic: resource.title,
    difficulty: "MEDIUM",
    count: 5,
    text: extracted.pages
      .map((page) => `Page ${page.pageNumber}\n${page.text}`)
      .join("\n\n"),
  });

  try {
    return await prisma.quiz.create({
      data: {
        title: generated.title,
        description: isFinal
          ? "Final assessment based on the complete PDF."
          : `Assessment for pages ${chunkStart}-${chunkEnd}.`,
        topic: generated.topic,
        difficulty: generated.difficulty,
        subjectId: resource.subjectId,
        noteId: type === "NOTE" ? resource.id : undefined,
        createdById: user.id,
        quizType: isFinal ? QuizType.FINAL : QuizType.CHUNK,
        sourceType: type as ReadingResourceType,
        sourceId: resource.id,
        startPage: chunkStart,
        endPage: chunkEnd,
        idempotencyKey,
        questions: {
          create: generated.questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            order: index + 1,
          })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });
  } catch (error) {
    const duplicate = await prisma.quiz.findUnique({
      where: { idempotencyKey },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (duplicate) return duplicate;
    throw error;
  }
}

export function hideQuizAnswers<T extends {
  questions: Array<{
    correctOption: number;
    explanation?: string | null;
    [key: string]: unknown;
  }>;
}>(quiz: T) {
  return {
    ...quiz,
    questions: quiz.questions.map(({ correctOption, explanation, ...question }) => question),
  };
}

export async function submitReadingQuiz(
  quizId: string,
  answers: number[],
  idempotencyKey: string | undefined,
  user: ReadingUser,
) {
  if (!Array.isArray(answers) || answers.some(
    (answer) => !Number.isInteger(answer) || answer < 0 || answer > 3,
  )) {
    throw new Error("Answers must be zero-based option indexes.");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz || quiz.sourceType === null || quiz.sourceId === null) {
    throw new Error("Reading quiz not found.");
  }

  await getReadableResource(quiz.sourceType, quiz.sourceId, user);

  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_resourceType_resourceId: {
        userId: user.id,
        resourceType: quiz.sourceType,
        resourceId: quiz.sourceId,
      },
    },
    include: { pages: { select: { pageNumber: true } } },
  });

  if (!progress) throw new Error("Reading progress not found.");

  const requiredStart = quiz.quizType === QuizType.FINAL ? 1 : quiz.startPage;
  const requiredEnd = quiz.quizType === QuizType.FINAL
    ? progress.totalPages
    : quiz.endPage;

  if (requiredStart === null || requiredEnd === null) {
    throw new Error("Quiz page range is missing.");
  }

  const visited = new Set(progress.pages.map((page) => page.pageNumber));
  for (let page = requiredStart; page <= requiredEnd; page++) {
    if (!visited.has(page)) throw new Error("Read the required pages before submitting.");
  }

  if (answers.length !== quiz.questions.length) {
    throw new Error("Submit one answer for every question.");
  }

  const key = idempotencyKey?.trim()
    ? `reading-attempt:${user.id}:${quiz.id}:${idempotencyKey.trim()}`
    : `reading-attempt:${user.id}:${quiz.id}:${randomUUID()}`;

  const prior = await prisma.quizAttempt.findUnique({
    where: { idempotencyKey: key },
  });
  if (prior) return prior;

  const score = quiz.questions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.correctOption ? 1 : 0),
    0,
  );

  try {
    return await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score,
        totalQuestions: quiz.questions.length,
        answers,
        idempotencyKey: key,
      },
    });
  } catch (error) {
    const duplicate = await prisma.quizAttempt.findUnique({
      where: { idempotencyKey: key },
    });
    if (duplicate) return duplicate;
    throw error;
  }
}

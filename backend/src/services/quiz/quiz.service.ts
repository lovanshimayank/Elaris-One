import { prisma } from "../../lib/prisma.js";
import { generateQuizWithAI } from "../ai/ai-service-client.js";

export async function createQuiz(userId: string, data: {
  title: string;
  description?: string;
  topic: string;
  difficulty?: string;
  subjectId?: string;
  noteId?: string;
  questions: Array<{
    question: string;
    options: string[];
    correctOption: number;
    explanation?: string;
  }>;
}) {
  return await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      topic: data.topic,
      difficulty: data.difficulty || "MEDIUM",
      subjectId: data.subjectId,
      noteId: data.noteId,
      createdById: userId,
      questions: {
        create: data.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          order: i,
        })),
      },
    },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: true,
      note: true,
    },
  });
}

export async function getAllQuizzes(subjectId?: string) {
  return await prisma.quiz.findMany({
    where: {
      ...(subjectId ? { subjectId } : {}),
    },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: true,
      createdBy: { select: { id: true, fullName: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuizById(quizId: string) {
  return await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { orderBy: { order: "asc" } },
      subject: true,
      note: true,
      createdBy: { select: { id: true, fullName: true } },
      attempts: {
        orderBy: { completedAt: "desc" },
        take: 5,
        include: { user: { select: { fullName: true } } },
      },
    },
  });
}

export async function generateQuizAI(userId: string, params: {
  topic: string;
  difficulty?: string;
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

  const generated = await generateQuizWithAI({
    topic: params.topic,
    difficulty: params.difficulty,
    count: params.count || 5,
    text: noteText,
  });

  return await createQuiz(userId, {
    title: generated.title || `${params.topic} Quiz`,
    topic: generated.topic || params.topic,
    difficulty: generated.difficulty || params.difficulty || "MEDIUM",
    subjectId: params.subjectId,
    noteId: params.noteId,
    questions: generated.questions,
  });
}

export async function submitQuizAttempt(userId: string, quizId: string, answers: Record<string, number>) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) throw new Error("Quiz not found");

  let score = 0;
  const breakdown: any[] = [];

  for (const q of quiz.questions) {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctOption;
    if (isCorrect) score += 1;

    breakdown.push({
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedOption: selected,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
      score,
      totalQuestions: quiz.questions.length,
      answers: breakdown,
    },
  });

  return {
    attemptId: attempt.id,
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    breakdown,
  };
}

export async function deleteQuiz(quizId: string, userId: string, isAdmin = false) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw new Error("Quiz not found");
  if (quiz.createdById !== userId && !isAdmin) {
    throw new Error("Unauthorized to delete this quiz");
  }

  await prisma.quiz.delete({ where: { id: quizId } });
  return true;
}
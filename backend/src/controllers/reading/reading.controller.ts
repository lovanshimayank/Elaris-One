import { Request, Response } from "express";
import {
  getReadingState,
  recordPageVisit,
  type ResourceType,
} from "../../services/reading/reading.service.js";
import {
  getOrCreateReadingQuiz,
  hideQuizAnswers,
  submitReadingQuiz,
} from "../../services/reading/reading-quiz.service.js";

const parseResourceType = (value: string): ResourceType | null => {
  const normalized = value.toUpperCase();
  return normalized === "NOTE" || normalized === "PYQ"
    ? normalized
    : null;
};

const handleError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  if (message.toLowerCase().includes("not found")) {
    return res.status(404).json({ success: false, message });
  }

  if (message.toLowerCase().includes("permission")) {
    return res.status(403).json({ success: false, message });
  }

  if (
    message.includes("Invalid") ||
    message.includes("Read ") ||
    message.includes("read ") ||
    message.includes("Answers must") ||
    message.includes("Submit one answer") ||
    message.includes("outside this PDF") ||
    message.includes("supported local upload format") ||
    message.includes("Not enough readable PDF text")
  ) {
    return res.status(400).json({ success: false, message });
  }

  console.error("Reading API error:", error);
  return res.status(500).json({
    success: false,
    message: "Unable to process the reading request.",
  });
};

const getAuthenticatedUser = (req: Request, res: Response) => {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return null;
  }
  return { id: user.id, role: user.role };
};

export const getReadingProgress = async (req: Request, res: Response) => {
  const type = parseResourceType(String(req.params.type));
  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Resource type must be NOTE or PYQ.",
    });
  }

  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const state = await getReadingState(type, String(req.params.id), user);
    return res.json({ success: true, data: state });
  } catch (error) {
    return handleError(res, error);
  }
};

export const savePageVisit = async (req: Request, res: Response) => {
  const type = parseResourceType(String(req.params.type));
  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Resource type must be NOTE or PYQ.",
    });
  }

  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const progress = await recordPageVisit(
      type,
      String(req.params.id),
      Number(req.params.pageNumber),
      user,
    );
    return res.json({ success: true, data: progress });
  } catch (error) {
    return handleError(res, error);
  }
};

export const generateReadingQuiz = async (req: Request, res: Response) => {
  const type = parseResourceType(String(req.params.type));
  if (!type) {
    return res.status(400).json({
      success: false,
      message: "Resource type must be NOTE or PYQ.",
    });
  }

  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  const requestedType = String(req.body?.quizType ?? "CHUNK").toUpperCase();
  if (requestedType !== "CHUNK" && requestedType !== "FINAL") {
    return res.status(400).json({
      success: false,
      message: "quizType must be CHUNK or FINAL.",
    });
  }

  const startPage =
    requestedType === "FINAL" ? 0 : Number(req.body?.startPage);

  try {
    const quiz = await getOrCreateReadingQuiz(
      type,
      String(req.params.id),
      startPage,
      user,
    );
    return res.json({
      success: true,
      data: hideQuizAnswers(quiz),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const submitReadingQuizAnswers = async (
  req: Request,
  res: Response,
) => {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const attempt = await submitReadingQuiz(
      String(req.params.quizId),
      req.body?.answers,
      req.get("Idempotency-Key"),
      user,
    );

    const quiz = await (await import("../../lib/prisma.js")).prisma.quiz.findUnique({
      where: { id: String(req.params.quizId) },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Reading quiz not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        attempt,
        review: quiz.questions.map((question, index) => ({
          questionId: question.id,
          correctOption: question.correctOption,
          explanation: question.explanation,
          selectedOption: Array.isArray(attempt.answers)
            ? attempt.answers[index]
            : null,
        })),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

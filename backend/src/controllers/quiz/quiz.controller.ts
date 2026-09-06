import { Request, Response } from "express";
import * as quizService from "../../services/quiz/quiz.service.js";

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subjectId as string | undefined;
    const quizzes = await quizService.getAllQuizzes(subjectId);
    return res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id as string);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    return res.json({ success: true, data: quiz });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, topic, difficulty, subjectId, noteId, questions } = req.body;
    if (!title || !topic || !questions || !questions.length) {
      return res.status(400).json({ success: false, message: "Title, topic, and questions are required" });
    }
    const quiz = await quizService.createQuiz(req.user!.id, {
      title,
      topic,
      difficulty,
      subjectId,
      noteId,
      questions,
    });
    return res.status(201).json({ success: true, message: "Quiz created", data: quiz });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, subjectId, noteId, count } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

    const quiz = await quizService.generateQuizAI(req.user!.id, {
      topic,
      difficulty,
      subjectId,
      noteId,
      count: count ? Number(count) : 5,
    });
    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully with AI",
      data: quiz,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ success: false, message: "Answers are required" });

    const result = await quizService.submitQuizAttempt(req.user!.id, req.params.id as string, answers);
    return res.json({ success: true, message: "Quiz evaluated", data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    await quizService.deleteQuiz(req.params.id as string, req.user!.id, req.user?.role === "ADMIN");
    return res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
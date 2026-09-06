import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  generateQuiz,
  submitQuiz,
  deleteQuiz,
} from "../../controllers/quiz/quiz.controller.js";

const router = Router();

router.get("/", authenticate, getQuizzes);
router.get("/:id", authenticate, getQuiz);
router.post("/", authenticate, createQuiz);
router.post("/generate", authenticate, generateQuiz);
router.post("/:id/submit", authenticate, submitQuiz);
router.delete("/:id", authenticate, deleteQuiz);

export default router;
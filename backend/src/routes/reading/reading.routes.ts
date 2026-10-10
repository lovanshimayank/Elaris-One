import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getReadingProgress,
  savePageVisit,
  generateReadingQuiz,
  submitReadingQuizAnswers,
} from "../../controllers/reading/reading.controller.js";

const router = Router();

router.post(
  "/quizzes/:quizId/attempts",
  authenticate,
  submitReadingQuizAnswers,
);

router.get("/:type/:id", authenticate, getReadingProgress);

router.post(
  "/:type/:id/pages/:pageNumber",
  authenticate,
  savePageVisit,
);

router.post(
  "/:type/:id/quizzes",
  authenticate,
  generateReadingQuiz,
);

export default router;

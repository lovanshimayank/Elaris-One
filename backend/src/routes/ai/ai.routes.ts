import { Router } from "express";
import { chatWithAI } from "../../controllers/ai/ai.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/chat",
  authenticate,
  chatWithAI
);

export default router;
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getDecks,
  getDeck,
  createDeck,
  generateDeck,
  deleteDeck,
} from "../../controllers/flashcards/flashcard.controller.js";

const router = Router();

router.get("/", authenticate, getDecks);
router.get("/:id", authenticate, getDeck);
router.post("/", authenticate, createDeck);
router.post("/generate", authenticate, generateDeck);
router.delete("/:id", authenticate, deleteDeck);

export default router;
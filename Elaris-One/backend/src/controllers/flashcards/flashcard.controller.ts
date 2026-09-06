import { Request, Response } from "express";
import * as flashcardService from "../../services/flashcards/flashcard.service.js";

export const getDecks = async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subjectId as string | undefined;
    const decks = await flashcardService.getAllDecks(req.user?.id, subjectId);
    return res.json({ success: true, count: decks.length, data: decks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeck = async (req: Request, res: Response) => {
  try {
    const deck = await flashcardService.getDeckById(req.params.id as string);
    if (!deck) return res.status(404).json({ success: false, message: "Deck not found" });
    return res.json({ success: true, data: deck });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeck = async (req: Request, res: Response) => {
  try {
    const { title, description, subjectId, noteId, cards } = req.body;
    if (!title || !cards || !cards.length) {
      return res.status(400).json({ success: false, message: "Title and cards are required" });
    }
    const deck = await flashcardService.createDeck(req.user!.id, {
      title,
      description,
      subjectId,
      noteId,
      cards,
    });
    return res.status(201).json({ success: true, message: "Deck created", data: deck });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const generateDeck = async (req: Request, res: Response) => {
  try {
    const { topic, subjectId, noteId, count } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

    const deck = await flashcardService.generateDeckWithAI(req.user!.id, {
      topic,
      subjectId,
      noteId,
      count: count ? Number(count) : 6,
    });
    return res.status(201).json({
      success: true,
      message: "Flashcards generated successfully with AI",
      data: deck,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDeck = async (req: Request, res: Response) => {
  try {
    await flashcardService.deleteDeck(req.params.id as string, req.user!.id, req.user?.role === "ADMIN");
    return res.json({ success: true, message: "Deck deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
import { Router, Request, Response } from "express";

import {
  generateAIResponse,
} from "../../services/ai/gemini.service.js";

import {
  moderateContent,
} from "../../services/ai/content-moderation.service.js";

const router = Router();

/*
 * Existing Elaris AI chat endpoint
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await generateAIResponse(message);

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        reply,
      },
    });
  } catch (error: any) {
    console.error("AI ROUTE ERROR:", error?.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
      error:
        process.env.NODE_ENV === "development"
          ? error?.message || String(error)
          : undefined,
    });
  }
});


/*
 * Temporary moderation test endpoint.
 *
 * This will later be used internally by the upload pipeline.
 */
router.post(
  "/moderate",
  async (req: Request, res: Response) => {
    try {
      const {
        content,
        contentType,
        title,
      } = req.body;

      if (
        !content ||
        typeof content !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Content is required",
        });
      }

      const result = await moderateContent({
        content,
        contentType,
        title,
      });

      return res.status(200).json({
        success: true,
        message: "Content moderation completed",
        data: result,
      });
    } catch (error: any) {
      console.error(
        "MODERATION ROUTE ERROR:",
        error?.message || error
      );

      return res.status(500).json({
        success: false,
        message: "Content moderation failed",
      });
    }
  }
);

export default router;
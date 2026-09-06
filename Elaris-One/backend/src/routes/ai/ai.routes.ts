import { Router, Request, Response } from "express";
import { chatWithAI } from "../../controllers/ai/ai.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { moderateContent } from "../../services/ai/content-moderation.service.js";

const router = Router();

/**
 * Context-aware campus AI assistant chat.
 * Pulls the requesting user's profile plus recent notes/PYQs/opportunities
 * to ground the response, when the request is authenticated.
 */
router.post("/chat", authenticate, chatWithAI);

/**
 * Content moderation utility endpoint.
 * Used internally by the upload pipeline; also exposed here for testing.
 */
router.post("/moderate", async (req: Request, res: Response) => {
  try {
    const { content, contentType, title } = req.body;

    if (!content || typeof content !== "string") {
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
    console.error("MODERATION ROUTE ERROR:", error?.message || error);

    return res.status(500).json({
      success: false,
      message: "Content moderation failed",
    });
  }
});

export default router;
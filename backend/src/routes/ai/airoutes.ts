import { Router, Request, Response } from "express";
import { generateAIResponse } from "../../services/ai/gemini.service.js";

const router = Router();

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

export default router;
import { Request, Response } from "express";
import fs from "fs";
import { moderateUploadedFile } from "../../services/ai/file-content-moderation.service";

export const uploadFile = async (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {
    console.log("========== FILE UPLOAD ==========");
    console.log("Original:", req.file.originalname);
    console.log("Stored:", req.file.path);
    console.log("Type:", req.file.mimetype);
    console.log("Size:", req.file.size);

    const moderation = await moderateUploadedFile(
      req.file.path,
      req.file.mimetype
    );

    console.log("========== FILE MODERATION ==========");
    console.log(moderation);

    /*
     * HARD BLOCK:
     * Explicit/nudity/clearly unsafe content must never remain
     * in the application's upload storage.
     */
    if (moderation.status === "UNSAFE") {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete unsafe uploaded file:",
          deleteError
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Upload rejected by AI content moderation. The file contains prohibited or inappropriate content.",
        moderation: {
          status: moderation.status,
          score: moderation.score,
          reasons: moderation.reasons,
          categories: moderation.categories,
          summary: moderation.summary,
        },
      });
    }

    const folder = req.body.folder || "misc";

    return res.status(201).json({
      success: true,
      message:
        moderation.status === "REVIEW"
          ? "File uploaded successfully and flagged for moderation review"
          : "File uploaded successfully and passed AI content inspection",

      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,

        url: `/api/v1/downloads/${folder}/${req.file.filename}`,

        moderation: {
          status: moderation.status,
          score: moderation.score,
          reasons: moderation.reasons,
          categories: moderation.categories,
          summary: moderation.summary,
        },
      },
    });
  } catch (error: any) {
    console.error("Upload Error:", error);

    try {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (deleteError) {
      console.error(
        "Failed to cleanup uploaded file:",
        deleteError
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message || "File upload and moderation failed",
    });
  }
};

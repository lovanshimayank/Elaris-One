import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const downloadFile = (
  req: Request,
  res: Response
) => {
  try {
    const folder = req.params.folder as string;
    const filename = req.params.filename as string;

    // Prevent path traversal attacks
    if (
      folder.includes("..") ||
      filename.includes("..") ||
      folder.includes("/") ||
      folder.includes("\\") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      folder,
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Download File Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
};
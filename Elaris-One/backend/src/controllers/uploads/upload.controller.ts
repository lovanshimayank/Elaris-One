import { Request, Response } from "express";

export const uploadFile = (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const folder =
    req.body.folder || "misc";

  return res.status(201).json({
    success: true,
    message: "File uploaded successfully",

    data: {
      filename: req.file.filename,

      originalName: req.file.originalname,

      size: req.file.size,

      type: req.file.mimetype,

      url: `/uploads/${folder}/${req.file.filename}`,
    },
  });
};
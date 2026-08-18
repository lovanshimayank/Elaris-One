import { Request, Response } from "express";

import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../../services/notes/note.service.js";

export const createNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("========== NOTE CONTROLLER ==========");
    console.log("Request Body:", req.body);

    const note = await createNote(
      req.user!.id,
      req.body
    );

    const moderationStatus = note.moderationStatus;

    let message = "Note created successfully";

    if (moderationStatus === "APPROVED") {
      message =
        "Note created and automatically approved by AI moderation";
    }

    if (moderationStatus === "PENDING") {
      message =
        "Note submitted successfully and is awaiting moderation review";
    }

    if (moderationStatus === "REJECTED") {
      message =
        "Note was rejected by AI content moderation";
    }

    return res.status(201).json({
      success: true,
      message,
      data: {
        id: note.id,
        title: note.title,
        description: note.description,
        semester: note.semester,
        branch: note.branch,
        pdfUrl: note.pdfUrl,

        moderation: {
          status: note.moderationStatus,
          score: note.moderationScore,
          reasons: note.moderationReasons,
          categories: note.moderationCategories,
          summary: note.moderationSummary,
          moderatedAt: note.moderatedAt,
        },

        publication: {
          isApproved: note.isApproved,
          isPublic: note.isPublic,
        },
      },
    });
  } catch (error: any) {
    console.error("Create Note Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create note",
    });
  }
};

export const getNotesController = async (
  req: Request,
  res: Response
) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const subjectId =
      typeof req.query.subjectId === "string"
        ? req.query.subjectId
        : undefined;

    const branch =
      typeof req.query.branch === "string"
        ? req.query.branch
        : undefined;

    const semester =
      typeof req.query.semester === "string"
        ? Number(req.query.semester)
        : undefined;

    const notes = await getAllNotes({
      search,
      subjectId,
      branch,
      semester,
    });

    return res.json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error: any) {
    console.error("Get Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};

export const getNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    const note = await getNoteById(
      req.params.id as string
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    console.error("Get Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
};

export const updateNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    const note = await getNoteById(
      req.params.id as string
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (
      note.uploadedBy.id !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this note",
      });
    }

    /*
     * IMPORTANT:
     * Moderation and publication fields are intentionally
     * excluded from normal update operations.
     *
     * They will be controlled by the future admin
     * moderation workflow.
     */
    const allowedFields = [
      "title",
      "description",
      "subjectId",
      "semester",
      "branch",
      "pdfUrl",
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedNote = await updateNote(
      req.params.id as string,
      updateData
    );

    return res.json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error: any) {
    console.error("Update Note Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update note",
    });
  }
};

export const deleteNoteController = async (
  req: Request,
  res: Response
) => {
  try {
    const note = await getNoteById(
      req.params.id as string
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (
      note.uploadedBy.id !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this note",
      });
    }

    await deleteNote(req.params.id as string);

    return res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Note Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to delete note",
    });
  }
};
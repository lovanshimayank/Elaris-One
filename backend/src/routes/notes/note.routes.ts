import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

import {
  createNoteController,
  getNotesController,
  getNoteController,
  updateNoteController,
  deleteNoteController,
} from "../../controllers/notes/note.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACULTY", "STUDENT"),
  createNoteController
);

router.get(
  "/",
  authenticate,
  getNotesController
);

router.get(
  "/:id",
  authenticate,
  getNoteController
);

router.patch(
  "/:id",
  authenticate,
  updateNoteController
);

router.delete(
  "/:id",
  authenticate,
  deleteNoteController
);

export default router;

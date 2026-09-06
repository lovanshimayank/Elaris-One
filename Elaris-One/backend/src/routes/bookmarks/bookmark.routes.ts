import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

import {
  createBookmark,
  allBookmarks,
  deleteBookmark,
} from "../../controllers/bookmarks/bookmark.controller";

const router = Router();

router.post("/", authenticate, createBookmark);

router.get("/", authenticate, allBookmarks);

router.delete("/:id", authenticate, deleteBookmark);

export default router;
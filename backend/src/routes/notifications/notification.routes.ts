import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getNotifications,
  markRead,
  markAllRead,
} from "../../controllers/notifications/notification.controller.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markRead);
router.post("/mark-all-read", authenticate, markAllRead);

export default router;
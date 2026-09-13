import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import {
  getMetrics,
  getUsers,
  toggleStatus,
  changeRole,
  getModerationQueue,
  processModeration,
  deleteNote,
  deletePYQ,
  deleteOpportunity,
  getAllContent,
  bulkDeleteNotes,
  bulkDeletePYQs,
  bulkDeleteOpportunities,
} from "../../controllers/admin/admin.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/metrics", getMetrics);
router.get("/users", getUsers);

router.patch("/users/:id/status", toggleStatus);
router.patch("/users/:id/role", changeRole);

router.get("/moderation", getModerationQueue);
router.post("/moderation/resolve", processModeration);

/// ============================================================
// ADMIN CONTENT MANAGEMENT
// ============================================================

// Get all content
router.get("/content", getAllContent);

// Bulk delete routes MUST come before /:id routes
router.delete("/notes/bulk", bulkDeleteNotes);
router.delete("/pyqs/bulk", bulkDeletePYQs);
router.delete(
  "/opportunities/bulk",
  bulkDeleteOpportunities
);

// Single delete routes
router.delete("/notes/:id", deleteNote);
router.delete("/pyqs/:id", deletePYQ);
router.delete(
  "/opportunities/:id",
  deleteOpportunity
);

export default router;

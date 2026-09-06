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
} from "../../controllers/admin/admin.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/metrics", getMetrics);
router.get("/users", getUsers);
router.patch("/users/:id/status", toggleStatus);
router.patch("/users/:id/role", changeRole);
router.get("/moderation", getModerationQueue);
router.post("/moderation/resolve", processModeration);

export default router;
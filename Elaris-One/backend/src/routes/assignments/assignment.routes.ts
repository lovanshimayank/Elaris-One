import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../controllers/assignments/assignment.controller.js";

const router = Router();

router.get("/", authenticate, getAssignments);
router.post("/", authenticate, createAssignment);
router.patch("/:id", authenticate, updateAssignment);
router.delete("/:id", authenticate, deleteAssignment);

export default router;
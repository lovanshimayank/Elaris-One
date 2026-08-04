import { Router } from "express";

import authRoutes from "./auth/auth.routes.js";

import userRoutes from "./users/user.routes";
import noteRoutes from "./notes/note.routes.js";
import pyqRoutes from "./pyqs/pyq.routes.js";
const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/notes", noteRoutes);
router.use("/pyqs", pyqRoutes);

export default router;
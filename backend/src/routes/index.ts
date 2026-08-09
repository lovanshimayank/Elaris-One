import { Router } from "express";

import authRoutes from "./auth/auth.routes.js";

import userRoutes from "./users/user.routes";
import noteRoutes from "./notes/note.routes.js";
import pyqRoutes from "./pyqs/pyq.routes.js";
import opportunityRoutes from "./opportunities/opportunity.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import searchRoutes from "./search/search.routes.js";
import uploadRoutes from "./uploads/upload.routes";
import departmentRoutes from "./departments/department.routes";
import subjectRoutes from "./subjects/subject.routes";
import bookmarkRoutes from "./bookmarks/bookmark.routes";
import aiRoutes from "./ai/airoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/notes", noteRoutes);
router.use("/pyqs", pyqRoutes);
router.use("/opportunities", opportunityRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/search", searchRoutes);
router.use("/upload", uploadRoutes);
router.use("/departments", departmentRoutes);
router.use("/subjects", subjectRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/ai", aiRoutes);

router.get("/test-ai", (_req, res) => {
  res.json({
    success: true,
    message: "AI route is mounted correctly",
  });
});

export default router;
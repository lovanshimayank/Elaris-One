import { Router } from "express";

import {
  getAllSubjects,
  addSubject,
} from "../../controllers/subjects/subject.controller";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getAllSubjects
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACULTY"),
  addSubject
);

export default router;

import { Router } from "express";

import {
  getAllDepartments,
  addDepartment,
} from "../../controllers/departments/department.controller";

import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getAllDepartments
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACULTY"),
  addDepartment
);

export default router;
 
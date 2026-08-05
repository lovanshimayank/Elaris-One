import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";
import { dashboardController } from "../../controllers/dashboard/dashboard.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  dashboardController
);

export default router;
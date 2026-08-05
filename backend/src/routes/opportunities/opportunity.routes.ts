import { Router } from "express";

import {
  createOpportunityController,
  getAllOpportunityController,
  getSingleOpportunityController,
  updateOpportunityController,
  deleteOpportunityController,
} from "../../controllers/opportunities/opportunity.controller";

import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  createOpportunityController
);

router.get(
  "/",
  getAllOpportunityController
);

router.get(
  "/:id",
  getSingleOpportunityController
);

router.patch(
  "/:id",
  authenticate,
  updateOpportunityController
);

router.delete(
  "/:id",
  authenticate,
  deleteOpportunityController
);

export default router;
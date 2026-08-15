import { Router } from "express";

import {
    createPYQController,
    getAllPYQController,
    getSinglePYQController,
    updatePYQController,
    deletePYQController
} from "../../controllers/pyqs/pyq.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "FACULTY"),
    createPYQController
);

router.get(
    "/",
    getAllPYQController
);

router.get(
    "/:id",
    getSinglePYQController
);

router.patch(
    "/:id",
    authenticate,
    updatePYQController
);

router.delete(
    "/:id",
    authenticate,
    deletePYQController
);

export default router;
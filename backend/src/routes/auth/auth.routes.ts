import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  getProfile,
  updateProfile,
} from "../../controllers/users/user.controller";

const router = Router();

router.get("/me", authenticate, getProfile);

router.patch("/me", authenticate, updateProfile);

export default router;
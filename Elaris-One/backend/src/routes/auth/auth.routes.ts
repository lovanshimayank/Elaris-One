import { Router } from "express";

import {
  register,
  login,
} from "../../controllers/auth/auth.controller";

import {
  registerValidation,
  loginValidation,
} from "../../validators/auth.validation";

const router = Router();

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

export default router;
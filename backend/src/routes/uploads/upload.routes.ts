import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";

import { upload } from "../../uploads/multer";

import { uploadFile } from "../../controllers/uploads/upload.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("file"),
  uploadFile
);

export default router;
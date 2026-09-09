import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";
import { downloadFile } from "../../controllers/downloads/download.controller";

const router = Router();

router.get(
  "/:folder/:filename",
  authenticate,
  downloadFile
);

export default router;
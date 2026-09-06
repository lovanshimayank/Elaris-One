import { Router } from "express";
import { globalSearchController } from "../../controllers/search/search.controller";

const router = Router();

router.get("/", globalSearchController);

export default router;
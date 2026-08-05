import { Router } from "express";
import {
  getAllSubjects,
  addSubject,
} from "../../controllers/subjects/subject.controller";

const router = Router();

router.get("/", getAllSubjects);

router.post("/", addSubject);

export default router;
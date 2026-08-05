import { Router } from "express";
import {
  getAllDepartments,
  addDepartment,
} from "../../controllers/departments/department.controller";

const router = Router();

router.get("/", getAllDepartments);

router.post("/", addDepartment);

export default router;
import { Request, Response } from "express";
import {
  getDepartments,
  createDepartment,
} from "../../services/departments/department.service";

export const getAllDepartments = async (
  req: Request,
  res: Response
) => {
  const departments = await getDepartments();

  res.json({
    success: true,
    data: departments,
  });
};

export const addDepartment = async (
  req: Request,
  res: Response
) => {
  const department = await createDepartment(req.body);

  res.status(201).json({
    success: true,
    data: department,
  });
};
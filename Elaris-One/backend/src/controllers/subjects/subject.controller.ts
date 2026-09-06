import { Request, Response } from "express";
import {
  getSubjects,
  createSubject,
} from "../../services/subjects/subject.service";

export const getAllSubjects = async (
  req: Request,
  res: Response
) => {
  const subjects = await getSubjects();

  res.json({
    success: true,
    data: subjects,
  });
};

export const addSubject = async (
  req: Request,
  res: Response
) => {
  const subject = await createSubject(req.body);

  res.status(201).json({
    success: true,
    data: subject,
  });
};
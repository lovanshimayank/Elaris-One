import { Request, Response } from "express";
import * as assignmentService from "../../services/assignments/assignment.service.js";

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const assignments = await assignmentService.getUserAssignments(req.user!.id, status);
    return res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, subjectId, dueDate, priority } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: "Title and due date are required" });
    }

    const assignment = await assignmentService.createAssignment(req.user!.id, {
      title,
      description,
      subjectId,
      dueDate,
      priority,
    });
    return res.status(201).json({ success: true, message: "Assignment created", data: assignment });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const updated = await assignmentService.updateAssignment(req.params.id as string, req.user!.id, req.body);
    return res.json({ success: true, message: "Assignment updated", data: updated });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    await assignmentService.deleteAssignment(req.params.id as string, req.user!.id);
    return res.json({ success: true, message: "Assignment deleted" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
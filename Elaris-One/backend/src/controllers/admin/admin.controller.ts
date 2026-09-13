import { Request, Response } from "express";
import * as adminService from "../../services/admin/admin.service.js";

export const getMetrics = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.getAdminMetrics();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const role = req.query.role as any;
    const users = await adminService.getAllUsers({ search, role });
    return res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await adminService.toggleUserStatus(req.params.id as string, Boolean(isActive));
    return res.json({ success: true, message: "User status updated", data: user });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const changeRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id as string, role);
    return res.json({ success: true, message: "User role updated", data: user });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getModerationQueue = async (_req: Request, res: Response) => {
  try {
    const queue = await adminService.getPendingModerations();
    return res.json({ success: true, data: queue });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processModeration = async (req: Request, res: Response) => {
  try {
    const { itemType, itemId, status, reasons, summary } = req.body;
    if (!itemType || !itemId || !status) {
      return res.status(400).json({ success: false, message: "itemType, itemId, and status are required" });
    }

    const result = await adminService.resolveModeration({
      itemType,
      itemId,
      status,
      reasons,
      summary,
    });
    return res.json({ success: true, message: `Item ${status.toLowerCase()}`, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (
  req: Request,
  res: Response
) => {
  try {
    const note = await adminService.deleteNoteByAdmin(
      req.params.id as string
    );

    return res.json({
      success: true,
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePYQ = async (
  req: Request,
  res: Response
) => {
  try {
    const pyq = await adminService.deletePYQByAdmin(
      req.params.id as string
    );

    return res.json({
      success: true,
      message: "PYQ deleted successfully",
      data: pyq,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteOpportunity = async (
  req: Request,
  res: Response
) => {
  try {
    const opportunity =
      await adminService.deleteOpportunityByAdmin(
        req.params.id as string
      );

    return res.json({
      success: true,
      message: "Opportunity deleted successfully",
      data: opportunity,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
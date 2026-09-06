import { Request, Response } from "express";
import * as notificationService from "../../services/notifications/notification.service.js";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const list = await notificationService.getUserNotifications(req.user!.id);
    const unreadCount = list.filter((n) => !n.isRead).length;
    return res.json({ success: true, count: list.length, unreadCount, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    await notificationService.markAsRead(req.params.id as string, req.user!.id);
    return res.json({ success: true, message: "Marked as read" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    return res.json({ success: true, message: "All marked as read" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
import { Request, Response } from "express";
import { getDashboard } from "../../services/dashboard/dashboard.service";

export const dashboardController = async (
  req: Request,
  res: Response
) => {
  const dashboard = await getDashboard(req.user!.id);

  return res.status(200).json({
    success: true,
    data: dashboard,
  });
};
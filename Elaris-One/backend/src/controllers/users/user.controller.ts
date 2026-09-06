import { Request, Response } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../../services/user/user.service";

export const getProfile = async (
  req: Request,
  res: Response
) => {
  const profile = await getMyProfile(req.user!.id);

  return res.status(200).json({
    success: true,
    data: profile,
  });
};

export const updateProfile = async (
  req: Request,
  res: Response
) => {
  const updated = await updateMyProfile(
    req.user!.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updated,
  });
};
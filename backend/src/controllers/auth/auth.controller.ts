import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { registerUser, loginUser } from "../../services/auth/auth.service.js";

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const result = await registerUser(req.body);
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { token, ...userData } = result;
    return res.status(201).json({ success: true, message: "User Registered Successfully", data: userData });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
  const { password, ...userData } = req.user;
  return res.status(200).json({ success: true, data: userData });
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const result = await loginUser(req.body);
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { token, ...userData } = result;
    return res.status(200).json({ success: true, message: "Login Successful", data: userData });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
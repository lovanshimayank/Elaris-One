import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  registerUser,
  loginUser,
} from "../../services/auth/auth.service.js";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
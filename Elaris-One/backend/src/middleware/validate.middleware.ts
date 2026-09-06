import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Generic middleware to run after express-validator rule chains.
 * Short-circuits with a 400 response if validation failed.
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
}

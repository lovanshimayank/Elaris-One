import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    /*
     * DEVELOPMENT DEMO MODE
     *
     * Used temporarily for the presentation build.
     * Production authentication remains below.
     */
    if (
      process.env.NODE_ENV === "development" &&
      (!authHeader || !authHeader.startsWith("Bearer "))
    ) {
      const demoUser = await prisma.user.findFirst({
        orderBy: {
          createdAt: "asc",
        },
      });

      if (!demoUser) {
        return res.status(401).json({
          success: false,
          message: "No demo user found",
        });
      }

      req.user = demoUser;

      console.log("DEMO MODE: Using user:", demoUser.email);

      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
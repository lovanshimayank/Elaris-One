import { Request, Response, NextFunction } from "express";

interface RateInfo {
  count: number;
  resetTime: number;
}

// Simple in-memory store per IP
const store = new Map<string, RateInfo>();

function createLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.toString() ||
      "unknown";

    const now = Date.now();
    let info = store.get(ip);

    if (!info || now > info.resetTime) {
      info = {
        count: 1,
        resetTime: now + windowMs,
      };

      store.set(ip, info);
      return next();
    }

    if (info.count >= maxRequests) {
      const retryAfter = Math.ceil(
        (info.resetTime - now) / 1000
      );

      res.setHeader("Retry-After", retryAfter.toString());

      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }

    info.count += 1;
    return next();
  };
}

export const globalLimiter = createLimiter(
  100,
  15 * 60 * 1000
);

export const authLimiter = createLimiter(
  20,
  15 * 60 * 1000
);
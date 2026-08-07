import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface JwtPayload {
  userId: string;
  role: string;
}

export const generateToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: 604800, // 7 days in seconds
  });
};

export const verifyToken = (
  token: string
): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
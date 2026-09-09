// src/errors/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError.js';

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
}


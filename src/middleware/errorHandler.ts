import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = (error as any).statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    error = new AppError(message, statusCode);
  }

  const appError = error as AppError;

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      error: appError
    })
  });
};
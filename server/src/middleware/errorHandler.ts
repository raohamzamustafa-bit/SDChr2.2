import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error & { status?: number; code?: string }, req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${status}: ${err.message}`);

  if (status === 500) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

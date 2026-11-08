import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

/** Prisma known-request errors carry a string `code` like "P2002". */
function prismaCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string' && /^P\d{4}$/.test(code)) return code;
  }
  return undefined;
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // Express identifies error handlers by arity, so `next` must stay declared.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message || 'Validation error',
      errors: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Malformed JSON body (express.json) — a client error, not a server crash.
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  // Map common Prisma failures to meaningful HTTP codes instead of a blank 500.
  switch (prismaCode(err)) {
    case 'P2002':
      return res.status(409).json({ success: false, message: 'A record with these details already exists' });
    case 'P2025':
      return res.status(404).json({ success: false, message: 'Record not found' });
    case 'P2003':
    case 'P2014':
      return res.status(409).json({
        success: false,
        message: 'This record is linked to other data and cannot be changed or deleted',
      });
    case 'P2023':
      return res.status(400).json({ success: false, message: 'Invalid id format' });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

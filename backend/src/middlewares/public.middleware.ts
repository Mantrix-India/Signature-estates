import crypto from 'crypto';
import net from 'net';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env';

/** Constant-time compare for the website server's shared key. */
function keyMatches(provided: string | undefined): boolean {
  const expected = env.publicSite.apiKey;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * The website fetches server-side, so the API sees the website server's IP.
 * When the request carries the correct X-Public-Api-Key, trust the visitor IP
 * it forwards in X-Client-IP. Anyone else gets their own socket/proxy IP —
 * spoofing X-Client-IP without the key does nothing.
 */
export function resolveClientIp(req: Request): string {
  if (keyMatches(req.get('x-public-api-key'))) {
    const forwarded = req.get('x-client-ip')?.trim();
    if (forwarded && net.isIP(forwarded)) return forwarded;
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

const tooMany = (message: string) => ({ success: false, message });

/** Hard limit on enquiries: default 5 per hour per visitor IP. */
export const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.publicSite.enquiryLimitPerHour,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `enquiry:${ipKeyGenerator(resolveClientIp(req))}`,
  message: tooMany('Too many enquiries from this connection. Please try again later or call us.'),
});

/**
 * Moderate limit on reads: default 120 per minute per IP. The website's own
 * server (correct X-Public-Api-Key) is exempt: ISR renders all come from one
 * IP and are already cached, so throttling them would only break the site.
 */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  skip: (req) => keyMatches(req.get('x-public-api-key')),
  limit: env.publicSite.readLimitPerMinute,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `read:${ipKeyGenerator(resolveClientIp(req))}`,
  message: tooMany('Too many requests. Please slow down.'),
});

/** CORS for the public router only — website origins from PUBLIC_SITE_ORIGINS. */
export const publicCors = cors({
  origin: env.publicSite.origins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
  maxAge: 600,
});

export function cacheFor(seconds: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);
    next();
  };
}

export function noStore(_req: Request, res: Response, next: NextFunction) {
  res.set('Cache-Control', 'no-store');
  next();
}

export function publicSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  next();
}

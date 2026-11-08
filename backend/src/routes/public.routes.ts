import express, { Router, Request, Response, NextFunction } from 'express';
import * as publicController from '../controllers/public.controller';
import {
  publicCors,
  publicSecurityHeaders,
  readLimiter,
  enquiryLimiter,
  cacheFor,
  noStore,
} from '../middlewares/public.middleware';

/**
 * /api/public — internet-facing, NO auth. Mounted in server.ts BEFORE the CRM
 * CORS, body parser and /api router, so it has its own CORS (website origins),
 * its own small body limit, and never touches authMiddleware.
 */
const router = Router();

router.use(publicSecurityHeaders);
router.use(publicCors);
router.use(express.json({ limit: '10kb' }));

router.get('/properties', readLimiter, cacheFor(60), publicController.listProperties);
router.get('/properties/:slug', readLimiter, cacheFor(60), publicController.getProperty);
router.get('/properties/:slug/similar', readLimiter, cacheFor(60), publicController.similarProperties);
router.get('/localities', readLimiter, cacheFor(300), publicController.localities);

router.post('/enquiries', enquiryLimiter, noStore, publicController.createEnquiry);

// Unknown public paths stop here instead of falling through to the CRM stack.
router.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Malformed or oversized JSON: answer 400/413 in the envelope instead of a 500.
router.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  next(err);
});

export default router;

import { Request, Response, NextFunction } from 'express';
import { getParam } from '../utils/getParam';
import { AppError } from '../utils/AppError';
import {
  publicListQuerySchema,
  publicSlugSchema,
  publicEnquirySchema,
  HONEYPOT_FIELD,
} from '../validators/public.validator';
import {
  listPublicProperties,
  getPublicPropertyBySlug,
  getSimilarPublicProperties,
  listPublicLocalities,
} from '../services/publicProperty.service';
import { submitPublicEnquiry } from '../services/publicEnquiry.service';

const ENQUIRY_RECEIVED = 'Thank you. A Signature Estates advisor will contact you shortly.';

function slugParam(req: Request): string {
  const parsed = publicSlugSchema.safeParse(getParam(req, 'slug'));
  if (!parsed.success) throw new AppError('Property not found', 404);
  return parsed.data;
}

export async function listProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const query = publicListQuerySchema.parse(req.query);
    const data = await listPublicProperties(query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getPublicPropertyBySlug(slugParam(req));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function similarProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSimilarPublicProperties(slugParam(req));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function localities(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listPublicLocalities();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    // Honeypot first, before validation, so a bot learns nothing from errors.
    const trap = req.body && typeof req.body === 'object' ? req.body[HONEYPOT_FIELD] : undefined;
    if (typeof trap === 'string' && trap.trim() !== '') {
      console.warn('[public-enquiry] Honeypot filled; silently discarded.');
      return res.status(200).json({ success: true, data: { message: ENQUIRY_RECEIVED } });
    }

    const input = publicEnquirySchema.parse(req.body ?? {});
    await submitPublicEnquiry(input);
    // Never return lead/client ids or anything about who was matched.
    res.status(200).json({ success: true, data: { message: ENQUIRY_RECEIVED } });
  } catch (err) {
    next(err);
  }
}

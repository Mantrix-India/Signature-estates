import { getParam } from '../utils/getParam';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
  setPublishedSchema,
} from '../validators/property.validator';
import {
  createProperty,
  setPropertyPublished,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../services/property.service';
import { AppError } from '../utils/AppError';

import { nearbyPlacesQuerySchema } from '../validators/property.validator';
import { geocodeProperty, getNearbyPlaces, setPropertyLocation } from '../services/property.service';


import { compareQuerySchema } from '../validators/property.validator';
import { compareProperties } from '../services/property.service';

const setLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = createPropertySchema.parse(req.body);
    const property = await createProperty(input, req.user.userId, req.user.role);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listPropertiesQuerySchema.parse(req.query);
    const result = await listProperties(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const property = await getPropertyById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = updatePropertySchema.parse(req.body);
    const property = await updateProperty(getParam(req, 'id'), input, req.user.role);
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function setPublished(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = setPublishedSchema.parse(req.body);
    const property = await setPropertyPublished(getParam(req, 'id'), input.isPublished, req.user.role);
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteProperty(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
}

export async function geocode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const property = await geocodeProperty(getParam(req, 'id'));
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function setLocation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = setLocationSchema.parse(req.body);
    const property = await setPropertyLocation(getParam(req, 'id'), input.latitude, input.longitude);
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function nearbyPlaces(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = nearbyPlacesQuerySchema.parse(req.query);
    const places = await getNearbyPlaces(getParam(req, 'id'), query.type, query.radius);
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    next(err);
  }
}

export async function compare(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = compareQuerySchema.parse(req.query);
    const ids = query.ids.split(',').map((id) => id.trim());
    const properties = await compareProperties(ids);
    res.status(200).json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
}
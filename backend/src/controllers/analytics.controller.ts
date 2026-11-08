import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as analyticsService from '../services/analytics.service';

type Handler = (req: AuthRequest) => Promise<unknown>;

/** Every analytics endpoint shares the same envelope and error path. */
function handle(fn: Handler) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

export const snapshot = handle((req) => analyticsService.getSnapshot(req.user));
export const overview = handle((req) => analyticsService.getOverview(req.user));
export const inventory = handle(() => analyticsService.getInventoryBreakdown());
export const leadFunnel = handle(() => analyticsService.getLeadFunnel());
export const revenueByMonth = handle((req) => analyticsService.getRevenueByMonth(req.user));
export const builderPerformance = handle(() => analyticsService.getBuilderPerformance());
export const conversionRate = handle(() => analyticsService.getConversionRate());

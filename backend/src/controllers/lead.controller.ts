import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createLeadSourceSchema,
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema,
  createActivitySchema,
  createTaskSchema,
  updateTaskSchema,
} from '../validators/lead.validator';
import * as leadService from '../services/lead.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function createSource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createLeadSourceSchema.parse(req.body);
    const source = await leadService.createLeadSource(input);
    res.status(201).json({ success: true, data: source });
  } catch (err) {
    next(err);
  }
}

export async function listSources(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sources = await leadService.listLeadSources();
    res.status(200).json({ success: true, data: sources });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createLeadSchema.parse(req.body);
    const lead = await leadService.createLead(input, user.userId);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listLeadsQuerySchema.parse(req.query);
    const result = await leadService.listLeads(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function board(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await leadService.getLeadBoard();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lead = await leadService.getLeadById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateLeadSchema.parse(req.body);
    const lead = await leadService.updateLead(getParam(req, 'id'), input, user.userId);
    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await leadService.deleteLead(getParam(req, 'id'), user.userId);
    res.status(200).json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createActivitySchema.parse(req.body);
    const activity = await leadService.addActivity(getParam(req, 'id'), input, user.userId);
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

export async function addTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createTaskSchema.parse(req.body);
    const task = await leadService.addTask(getParam(req, 'id'), input, user.userId);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await leadService.updateTask(getParam(req, 'taskId'), input, getParam(req, 'id'));
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await leadService.deleteTask(getParam(req, 'taskId'), getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
import { z } from 'zod';

// V2.1 canonical stages. WON is deliberately omitted from accepted INPUT (dormant):
// new writes never produce WON. Existing WON rows still read fine and are folded to
// CLOSED for display/analytics until the backfill migration runs.
const leadStageEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKING',
  'CLOSED',
  'LOST',
]);

export const createLeadSourceSchema = z.object({
  name: z.string().min(2, 'Source name is required'),
});

export const createLeadSchema = z.object({
  clientId: z.string().uuid('Invalid client id'),
  propertyId: z.string().uuid('Invalid property id').optional(),
  leadSourceId: z.string().uuid('Invalid lead source id').optional(),
  assignedToId: z.string().uuid('Invalid user id'),
  stage: leadStageEnum.optional(),
});

export const updateLeadSchema = z.object({
  propertyId: z.string().uuid().optional(),
  leadSourceId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  stage: leadStageEnum.optional(),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  stage: leadStageEnum.optional(),
  assignedToId: z.string().uuid().optional(),
  // 'created' = newest leads first (dashboard feed); default = recently updated.
  sort: z.enum(['updated', 'created']).default('updated'),
});

export const createActivitySchema = z.object({
  activityType: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().uuid('Invalid user id'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  dueDate: z.string().datetime().optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateLeadSourceInput = z.infer<typeof createLeadSourceSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
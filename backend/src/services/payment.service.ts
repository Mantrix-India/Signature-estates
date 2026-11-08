// src/services/payment.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { Actor, assertDealAccessById } from './deal.service';
import {
  CreatePaymentInput,
  UpdatePaymentInput,
  ListPaymentsQuery,
} from '../validators/payment.validator';

export async function createPayment(input: CreatePaymentInput, actor: Actor) {
  await assertDealAccessById(input.dealId, actor);
  return prisma.payment.create({
    data: {
      dealId: input.dealId,
      label: input.label,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      status: input.status,
      method: input.method,
      reference: input.reference,
      note: input.note,
      // A payment recorded as already PAID must carry a paid date, otherwise it
      // never shows up in monthly revenue.
      paidAt: input.status === 'PAID' ? new Date() : undefined,
      createdById: actor.userId,
    },
  });
}

export async function listPayments(query: ListPaymentsQuery, actor: Actor) {
  await assertDealAccessById(query.dealId, actor);
  return prisma.payment.findMany({
    where: { dealId: query.dealId },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function updatePayment(id: string, input: UpdatePaymentInput, actor: Actor) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new AppError('Payment not found', 404);
  await assertDealAccessById(payment.dealId, actor);

  // Stamp paidAt automatically when moving to PAID without an explicit timestamp,
  // and clear it when a payment is moved back out of PAID (undo / correction) so
  // revenue-by-month never counts money that wasn't actually received.
  let paidAt: Date | null | undefined = input.paidAt ? new Date(input.paidAt) : undefined;
  if (input.status === 'PAID' && !input.paidAt && !payment.paidAt) {
    paidAt = new Date();
  }
  if (input.status && input.status !== 'PAID' && !input.paidAt) {
    paidAt = null;
  }

  return prisma.payment.update({
    where: { id },
    data: {
      label: input.label,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      status: input.status,
      method: input.method,
      reference: input.reference,
      note: input.note,
      paidAt,
    },
  });
}

export async function deletePayment(id: string, actor: Actor) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new AppError('Payment not found', 404);
  await assertDealAccessById(payment.dealId, actor);
  await prisma.payment.delete({ where: { id } });
}
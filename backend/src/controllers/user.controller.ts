// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../middlewares/auth.middleware';
// import { prisma } from '../config/prisma';

// export async function list(req: AuthRequest, res: Response, next: NextFunction) {
//   try {
//     const users = await prisma.user.findMany({
//       where: { isActive: true },
//       select: { id: true, fullName: true, email: true, role: true },
//       orderBy: { fullName: 'asc' },
//     });
//     res.status(200).json({ success: true, data: users });
//   } catch (err) {
//     next(err);
//   }
// }

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getParam } from '../utils/getParam';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT']),
});

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: { fullName: 'asc' },
    });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateRoleSchema.parse(req.body);
    const targetId = getParam(req, 'id');

    if (req.user?.userId === targetId) {
      throw new AppError('You cannot change your own role', 400);
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data: { role: input.role },
      select: { id: true, fullName: true, email: true, role: true },
    });
    // Force re-login so the new role is in the user's next token.
    await prisma.refreshToken.deleteMany({ where: { userId: targetId } });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const targetId = getParam(req, 'id');

    if (req.user?.userId === targetId) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { isActive: false },
    });
    // Kill every session of the deactivated user.
    await prisma.refreshToken.deleteMany({ where: { userId: targetId } });
    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}
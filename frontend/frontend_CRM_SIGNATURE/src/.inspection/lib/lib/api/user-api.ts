// import { api } from '../axios';
// import { UserSummary } from '@/types/user';

// export async function listUsersRequest(): Promise<UserSummary[]> {
//   const { data } = await api.get('/users');
//   return data.data;
// }

import { api } from '../axios';
import { UserSummary } from '@/types/user';

export async function listUsersRequest(): Promise<UserSummary[]> {
  const { data } = await api.get('/users');
  return data.data;
}

export async function updateUserRoleRequest(
  userId: string,
  role: 'ADMIN' | 'MANAGER' | 'AGENT'
): Promise<UserSummary> {
  const { data } = await api.patch(`/users/${userId}/role`, { role });
  return data.data;
}

export async function deactivateUserRequest(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}
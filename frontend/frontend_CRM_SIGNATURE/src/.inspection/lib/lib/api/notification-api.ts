import { api } from '../axios';
import { NotificationResponse } from '@/types/notification';

export async function listNotificationsRequest(): Promise<NotificationResponse> {
  const { data } = await api.get('/notifications');
  return data.data;
}

export async function markNotificationReadRequest(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsReadRequest(): Promise<void> {
  await api.post('/notifications/read-all');
}
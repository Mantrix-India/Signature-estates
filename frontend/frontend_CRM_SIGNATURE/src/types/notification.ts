export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}
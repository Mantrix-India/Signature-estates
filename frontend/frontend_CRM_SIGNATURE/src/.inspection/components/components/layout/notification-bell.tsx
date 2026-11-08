'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/types/notification';
import {
  listNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from '@/lib/api/notification-api';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await listNotificationsRequest();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch {
      // silent fail — notification bell shouldn't interrupt the app
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleOpen() {
    setIsOpen((v) => !v);
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationReadRequest(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsReadRequest();
      fetchNotifications();
    } catch {
      // ignore
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`block w-full border-b border-neutral-50 px-4 py-3 text-left last:border-0 hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/50 ${
                    !n.isRead ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{n.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{n.message}</p>
                  <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
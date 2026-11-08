'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import { Loader2, Sun, Moon, Shield, User as UserIcon, Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { updateProfileRequest, changePasswordRequest } from '@/lib/api/auth-api';
import { listUsersRequest, updateUserRoleRequest, deactivateUserRequest } from '@/lib/api/user-api';
import { UserSummary } from '@/types/user';

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';
const cardClass =
  'rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage your profile, security, and workspace preferences
        </p>
      </div>

      <ProfileSection />
      <PasswordSection />

      <div className={cardClass}>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} Appearance
        </h2>
        {mounted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                theme === 'light'
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <Moon size={14} /> Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                theme === 'system'
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              System
            </button>
          </div>
        )}
      </div>

      {user?.role === 'ADMIN' && <TeamSection />}
    </div>
  );
}

function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateProfileRequest(fullName.trim());
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
        <UserIcon size={14} /> Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input value={user?.email ?? ''} disabled className={`${inputClass} opacity-60`} />
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Email cannot be changed
          </p>
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input value={user?.role ?? ''} disabled className={`${inputClass} opacity-60`} />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
        <Lock size={14} /> Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
          {isSaving ? 'Changing...' : 'Change password'}
        </button>
      </form>
    </div>
  );
}

function TeamSection() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const data = await listUsersRequest();
      setUsers(data);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleRoleChange(userId: string, role: 'ADMIN' | 'MANAGER' | 'AGENT') {
    setUpdatingId(userId);
    try {
      await updateUserRoleRequest(userId, role);
      toast.success('Role updated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeactivate(userId: string, name: string) {
    if (!confirm(`Deactivate ${name}? They will lose access immediately.`)) return;
    setUpdatingId(userId);
    try {
      await deactivateUserRequest(userId);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
        <Shield size={14} /> Team members
      </h2>

      {isLoading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {u.fullName}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-500">(you)</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  disabled={u.id === currentUser?.id || updatingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                  className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="AGENT">Agent</option>
                </select>
                <button
                  onClick={() => handleDeactivate(u.id, u.fullName)}
                  disabled={u.id === currentUser?.id || updatingId === u.id}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
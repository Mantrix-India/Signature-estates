// import { api } from '../axios';
// import { AuthResponse, User } from '@/types/auth';

// export async function registerRequest(payload: {
//   fullName: string;
//   email: string;
//   password: string;
// }): Promise<AuthResponse> {
//   const { data } = await api.post('/auth/register', payload);
//   return data.data;
// }

// export async function loginRequest(payload: {
//   email: string;
//   password: string;
// }): Promise<AuthResponse> {
//   const { data } = await api.post('/auth/login', payload);
//   return data.data;
// }

// export async function logoutRequest(refreshToken: string): Promise<void> {
//   await api.post('/auth/logout', { refreshToken });
// }

// export async function getMeRequest(): Promise<User> {
//   const { data } = await api.get('/auth/me');
//   return data.data;
// }

import { api } from '../axios';
import { AuthResponse, User } from '@/types/auth';

export async function registerRequest(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

export async function loginRequest(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function getMeRequest(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.data;
}

export async function updateProfileRequest(fullName: string): Promise<User> {
  const { data } = await api.patch('/auth/me', { fullName });
  return data.data;
}

export async function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.post('/auth/change-password', payload);
}
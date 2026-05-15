'use client';

import { authApi, ApiError } from './api';
import { clearSessionSnapshot, readSessionSnapshot, writeSessionSnapshot } from './session-storage';
import type { ApiUser, AuthSession } from './types';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const session = await authApi.login({ email: email.trim(), password });
    writeSessionSnapshot(session);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed.',
    };
  }
}

export async function logout() {
  try {
    await authApi.logout();
  } finally {
    clearSessionSnapshot();
  }
}

export function getSessionSnapshot() {
  return readSessionSnapshot();
}

export function isAuthenticated() {
  const session = readSessionSnapshot();
  return Boolean(session && new Date(session.refreshTokenExpiresAt).getTime() > Date.now());
}

export function sessionTimeRemaining() {
  const session = readSessionSnapshot();
  if (!session) {
    return 0;
  }

  return Math.max(0, new Date(session.refreshTokenExpiresAt).getTime() - Date.now());
}

export function getSessionUser(): ApiUser | null {
  return readSessionSnapshot()?.user ?? null;
}

export async function syncSession(): Promise<AuthSession> {
  try {
    const session = await authApi.me();
    writeSessionSnapshot(session);
    return session;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSessionSnapshot();
      throw error;
    }

    throw error instanceof ApiError ? error : new ApiError('Unable to verify your session.', 0);
  }
}

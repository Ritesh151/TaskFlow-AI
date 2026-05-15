'use client';

import type { AuthSession } from './types';

const SESSION_STORAGE_KEY = 'taskflow-session';
const SESSION_EVENT = 'taskflow:session-updated';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readSessionSnapshot(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function emitSessionEvent() {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export function writeSessionSnapshot(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  emitSessionEvent();
}

export function clearSessionSnapshot() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  emitSessionEvent();
}

export function subscribeToSessionSnapshot(onChange: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(SESSION_EVENT, onChange);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

'use client';

import type { AuthSession } from './types';

const SESSION_STORAGE_KEY = 'taskflow-session';
const SESSION_EVENT = 'taskflow:session-updated';

function canUseStorage() {
  return typeof window !== 'undefined';
}

// Cache the parsed snapshot so that getSnapshot in useSyncExternalStore
// returns a stable object reference when the underlying data hasn't changed.
// Without this, every call to readSessionSnapshot() creates a new object via
// JSON.parse, which React's useSyncExternalStore detects as a different value
// (by Object.is comparison), triggering an infinite re-render loop.
let cachedRaw: string | null = null;
let cachedSnapshot: AuthSession | null = null;

export function readSessionSnapshot(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedSnapshot = null;
    return null;
  }

  try {
    cachedSnapshot = JSON.parse(raw) as AuthSession;
    return cachedSnapshot;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    cachedRaw = null;
    cachedSnapshot = null;
    return null;
  }
}

export function invalidateSessionCache() {
  cachedRaw = null;
  cachedSnapshot = null;
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
  invalidateSessionCache();
  emitSessionEvent();
}

export function clearSessionSnapshot() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  invalidateSessionCache();
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

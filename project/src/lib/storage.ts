export const STORAGE_KEYS = {
  data: 'spendsense:data',
  session: 'spendsense:session',
  theme: 'spendsense:theme',
} as const;

export function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

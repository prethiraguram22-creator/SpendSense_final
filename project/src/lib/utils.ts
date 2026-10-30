export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function createId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

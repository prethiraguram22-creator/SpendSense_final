const pad = (value: number) => String(value).padStart(2, '0');

export function parseISODate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function monthKey(input: Date | string) {
  const date = typeof input === 'string' ? parseISODate(input) : input;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function currentMonthKey() {
  return monthKey(new Date());
}

export function getRecentMonths(count: number, reference: Date = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(reference.getFullYear(), reference.getMonth() - (count - 1 - index), 1);
    return { key: monthKey(date), label: date.toLocaleString('en-US', { month: 'short' }), date };
  });
}

export function monthsBetween(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

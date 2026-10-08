export function todayKey(): string {
  return dateKey(new Date());
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysBetween(a: string, b: string): number {
  const da = parseKey(a);
  const db = parseKey(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function weekdayShort(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(d).replace('.', '').toUpperCase();
  return WEEKDAYS[d.getDay()];
}
export function weekdayLong(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(d);
  return WEEKDAYS_LONG[d.getDay()];
}
export function monthShort(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(d).replace('.', '').toUpperCase();
  return MONTHS[d.getMonth()];
}
export function monthLong(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(d);
  return MONTHS_LONG[d.getMonth()];
}

export function fullDateStr(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  return `${weekdayLong(d)}, ${monthLong(d)} ${d.getDate()}, ${d.getFullYear()}`;
}

export function timeStr(d: Date, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good night';
}

export function greetingEs(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function relativeTime(ts: number, language: 'en' | 'es' = 'en'): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return language === 'es' ? 'hace un momento' : 'just now';
  if (mins < 60) return language === 'es' ? `hace ${mins} min` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return language === 'es' ? `hace ${hrs} h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return language === 'es' ? `hace ${days} d` : `${days}d ago`;
  return language === 'es' ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(ts)) : dateKey(new Date(ts));
}

export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

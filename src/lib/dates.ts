// Dates et statuts des événements, calculés en heure de Paris (au build comme dans le navigateur).

const TZ = "Europe/Paris";
const DAYS = ["DIM.", "LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM."];
const MONTHS_SHORT = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

type DateLike = { date: string; start?: string | null; end?: string | null };

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return { y, m, d };
}

/** Jour de la semaine d’une date civile (indépendant du fuseau). */
function weekday(iso: string): number {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** « VEN. 19/12/2025 » */
export function formatDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${DAYS[weekday(iso)]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

/** « 23H30 – 05H00 », « 15H00 », ou null si aucune heure n’est connue. */
export function formatHours(start?: string | null, end?: string | null): string | null {
  const f = (t: string) => t.replace(":", "H");
  if (start && end) return `${f(start)} – ${f(end)}`;
  if (start) return f(start);
  return null;
}

/** Pastille de date : { day: "09", month: "Oct." } */
export function dateBadge(iso: string) {
  const { m, d } = parts(iso);
  return { day: String(d).padStart(2, "0"), month: MONTHS_SHORT[m - 1] ?? "" };
}

export function year(iso: string): string {
  return iso.slice(0, 4);
}

/** Décalage de Paris (en minutes) à un instant donné. */
function parisOffsetMinutes(at: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(fmt.formatToParts(at).map((x) => [x.type, Number(x.value)]));
  const asUtc = Date.UTC(p.year ?? 0, (p.month ?? 1) - 1, p.day ?? 1, p.hour ?? 0, p.minute ?? 0, p.second ?? 0);
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** Instant UTC correspondant à une date et une heure civiles à Paris. */
export function parisInstant(iso: string, time = "00:00"): Date {
  const { y, m, d } = parts(iso);
  const [hh, mm] = time.split(":").map(Number) as [number, number];
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  return new Date(guess.getTime() - parisOffsetMinutes(guess) * 60000);
}

/**
 * Fin d’un événement : heure de fin (le lendemain si elle précède le début, cas d’une nuit),
 * sinon 6 h le lendemain pour une soirée sans heure de fin, sinon fin de journée.
 */
export function eventEnd(e: DateLike): Date {
  const { y, m, d } = parts(e.date);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  if (e.end) {
    const sameDay = !e.start || e.end > e.start;
    return parisInstant(sameDay ? e.date : next, e.end);
  }
  return parisInstant(next, "06:00");
}

export function isUpcoming(e: DateLike, now: Date = new Date()): boolean {
  return eventEnd(e).getTime() > now.getTime();
}

/** Prochain événement à venir (le plus proche), sinon le dernier passé. Liste triée ou non. */
export function featuredEvent<T extends DateLike>(events: T[], now: Date = new Date()): { event: T; upcoming: boolean } | null {
  const upcoming = events.filter((e) => isUpcoming(e, now)).sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming[0]) return { event: upcoming[0], upcoming: true };
  const past = [...events].sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ? { event: past[0], upcoming: false } : null;
}

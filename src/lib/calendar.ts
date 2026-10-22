// « Ajouter à mon agenda » : lien Google Agenda et fichier .ics généré dans le navigateur.
// Sans heure connue, l’événement est posé en journée entière : aucune heure n’est inventée.
import { eventEnd, parisInstant } from "./dates";

export type CalendarEvent = {
  slug: string;
  title: string;
  titlePrefix?: string | null;
  date: string;
  start?: string | null;
  end?: string | null;
  venue: string | null;
  city: string | null;
};

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const compactDate = (iso: string) => iso.replace(/-/g, "");

function nextDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

export function fullTitle(e: Pick<CalendarEvent, "title" | "titlePrefix">) {
  return e.titlePrefix ? `${e.titlePrefix} ${e.title}` : e.title;
}

export function place(e: Pick<CalendarEvent, "venue" | "city">): string {
  return [e.venue, e.city].filter(Boolean).join(" — ");
}

function range(e: CalendarEvent): { start: string; end: string; allDay: boolean } {
  if (!e.start) return { start: compactDate(e.date), end: compactDate(nextDay(e.date)), allDay: true };
  return { start: stamp(parisInstant(e.date, e.start)), end: stamp(eventEnd(e)), allDay: false };
}

export function googleCalendarUrl(e: CalendarEvent, pageUrl: string): string {
  const { start, end } = range(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: fullTitle(e),
    dates: `${start}/${end}`,
    details: pageUrl,
    location: place(e),
    ctz: "Europe/Paris",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function icsContent(e: CalendarEvent, pageUrl: string, siteHost: string): string {
  const { start, end, allDay } = range(e);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Outrance//Agenda//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@${siteHost}`,
    `DTSTAMP:${stamp(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${escapeIcs(fullTitle(e))}`,
    `LOCATION:${escapeIcs(place(e))}`,
    `URL:${pageUrl}`,
    `DESCRIPTION:${escapeIcs(pageUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function downloadIcs(e: CalendarEvent, pageUrl: string, siteHost: string) {
  const blob = new Blob([icsContent(e, pageUrl, siteHost)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${e.slug}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

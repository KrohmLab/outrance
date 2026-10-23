// Données dérivées de la fiche événement : statut, textes de meta, JSON-LD, liens calculés.
// Rien n’est inventé : chaque valeur vient du contenu ou est masquée quand elle manque.
import type { OutranceEvent } from "../../content/schemas";
import { fullTitle, place } from "../../lib/calendar";
import { eventEnd, formatDate, parisInstant } from "../../lib/dates";
import type { EventStatus } from "../Tag";

/** Artiste du roster présent dans le line-up (lien vers son panneau). */
export type RosterLink = { slug: string; name: string };

export function eventStatus(
  e: Pick<OutranceEvent, "ticketStatus">,
  upcoming: boolean,
): EventStatus {
  return upcoming ? (e.ticketStatus ?? "upcoming") : "past";
}

/** « Shotgun » si la billetterie est sur shotgun.live, sinon rien. */
export function ticketProvider(url: string): string | null {
  try {
    return new URL(url).hostname.endsWith("shotgun.live") ? "Shotgun" : null;
  } catch {
    return null;
  }
}

// Chasse des capitales d’Unbounded 800, en em (mesurée dans le navigateur) ; 0,95 pour tout autre signe.
const GLYPH_EM: Record<string, number> = {
  A: 0.977,
  B: 0.895,
  C: 0.942,
  D: 0.936,
  E: 0.803,
  F: 0.781,
  G: 0.97,
  H: 0.947,
  I: 0.362,
  J: 0.815,
  K: 0.882,
  L: 0.772,
  M: 1.255,
  N: 0.983,
  O: 0.97,
  P: 0.825,
  Q: 0.971,
  R: 0.863,
  S: 0.857,
  T: 0.829,
  U: 0.884,
  V: 0.951,
  W: 1.375,
  X: 0.896,
  Y: 0.94,
  Z: 0.819,
  "0": 0.935,
  "1": 0.536,
  "2": 0.85,
  "3": 0.85,
  "4": 0.88,
  "5": 0.817,
  "6": 0.867,
  "7": 0.769,
  "8": 0.905,
  "9": 0.867,
  Œ: 1.33,
  Æ: 1.262,
  "&": 0.961,
  "'": 0.291,
  "’": 0.31,
  "-": 0.377,
  ".": 0.314,
  ":": 0.339,
  "!": 0.338,
  "?": 0.722,
  "/": 0.472,
};

/** Largeur (en em) du plus long mot du titre en capitales, pour que le h1 ne coupe ni ne déborde jamais. */
export function longestWordEm(title: string): number {
  const width = (word: string) =>
    [...word.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce(
      (sum, ch) => sum + (GLYPH_EM[ch] ?? 0.95),
      0,
    );
  return Math.max(3.6, ...title.split(/\s+/).map(width));
}

/** « VEN. 19/12 » (barre collante mobile). */
export function shortDate(iso: string): string {
  return formatDate(iso).slice(0, -5);
}

/** Recherche Google Maps sur « lieu ville », seulement si les deux sont connus. */
export function mapsUrl(
  e: Pick<OutranceEvent, "venue" | "city">,
): string | null {
  if (!e.venue || !e.city) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue} ${e.city}`)}`;
}

/** Découpe « Originz vs Rayzorks » en noms d’artistes (même règle que load.server.ts). */
export function splitNames(name: string): string[] {
  return name.split(/\s+(?:vs\.?|b2b|&)\s+/i).map((p) => p.trim());
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "’",
};

function firstParagraph(html: string): string {
  const p = /<p>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? "";
  return p
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** Description de meta : accroche, sinon début de la description, sinon « date · lieu ». */
export function metaDescription(e: OutranceEvent): string {
  if (e.tagline) return e.tagline;
  const intro = firstParagraph(e.bodyHtml);
  if (intro) return truncate(intro);
  return [formatDate(e.date), place(e)].filter(Boolean).join(" · ");
}

/** « 15,99 € » → { price: "15.99", priceCurrency: "EUR" } ; tout autre format est ignoré. */
function parsePrice(price: string | null | undefined) {
  const m = price ? /^(\d+(?:,\d{1,2})?)\s*€$/.exec(price.trim()) : null;
  return m?.[1] ? { price: m[1].replace(",", "."), priceCurrency: "EUR" } : {};
}

/** JSON-LD schema.org/Event de la fiche. */
export function eventJsonLd(
  e: OutranceEvent,
  url: string,
  organizer: { name: string; url: string },
) {
  const location = place(e) || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: fullTitle(e),
    url,
    description: metaDescription(e),
    startDate: e.start ? parisInstant(e.date, e.start).toISOString() : e.date,
    ...(e.start && e.end ? { endDate: eventEnd(e).toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.venue ?? location,
      address: {
        "@type": "PostalAddress",
        ...(e.city ? { addressLocality: e.city } : {}),
        addressCountry: e.country,
      },
    },
    organizer: { "@type": "Organization", ...organizer },
    ...(e.lineup.length
      ? {
          performer: e.lineup
            .flatMap((l) => splitNames(l.name))
            .map((name) => ({ "@type": "PerformingGroup", name })),
        }
      : {}),
    ...(e.ticketUrl
      ? {
          offers: {
            "@type": "Offer",
            url: e.ticketUrl,
            availability:
              e.ticketStatus === "soldOut"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            ...parsePrice(e.price),
          },
        }
      : {}),
  };
}

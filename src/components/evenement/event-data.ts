// Données dérivées de la fiche événement : statut, textes de meta, JSON-LD, liens calculés.
// Rien n’est inventé : chaque valeur vient du contenu ou est masquée quand elle manque.
import type { OutranceEvent } from "../../content/schemas";
import { fullTitle, place } from "../../lib/calendar";
import { eventEnd, formatDate, parisInstant } from "../../lib/dates";
import type { EventStatus } from "../Tag";

/** Artiste du roster présent dans le line-up (lien vers son panneau). */
export type RosterLink = { slug: string; name: string };

export function eventStatus(e: Pick<OutranceEvent, "ticketStatus">, upcoming: boolean): EventStatus {
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

/** Nombre de caractères du plus long mot du titre (pour que le h1 ne déborde jamais de sa colonne). */
export function longestWord(title: string): number {
  return Math.max(4, ...title.split(/\s+/).map((w) => w.length));
}

/** « VEN. 19/12 » (barre collante mobile). */
export function shortDate(iso: string): string {
  return formatDate(iso).slice(0, -5);
}

/** Recherche Google Maps sur « lieu ville », seulement si les deux sont connus. */
export function mapsUrl(e: Pick<OutranceEvent, "venue" | "city">): string | null {
  if (!e.venue || !e.city) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue} ${e.city}`)}`;
}

/** Découpe « Originz vs Rayzorks » en noms d’artistes (même règle que load.server.ts). */
export function splitNames(name: string): string[] {
  return name.split(/\s+(?:vs\.?|b2b|&)\s+/i).map((p) => p.trim());
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "’" };

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
export function eventJsonLd(e: OutranceEvent, url: string, organizer: { name: string; url: string }) {
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
      ? { performer: e.lineup.flatMap((l) => splitNames(l.name)).map((name) => ({ "@type": "PerformingGroup", name })) }
      : {}),
    ...(e.ticketUrl
      ? {
          offers: {
            "@type": "Offer",
            url: e.ticketUrl,
            availability: e.ticketStatus === "soldOut" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            ...parsePrice(e.price),
          },
        }
      : {}),
  };
}

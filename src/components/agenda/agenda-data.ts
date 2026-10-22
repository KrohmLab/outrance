// Données et règles de la page Agenda : champs utiles d’un événement, filtre pays, libellés.
import type { OutranceEvent } from "../../content/schemas";

/** Événement tel que renvoyé par le loader de /agenda (sans le corps HTML). */
export type AgendaEvent = Pick<
  OutranceEvent,
  "slug" | "title" | "titlePrefix" | "date" | "start" | "end" | "venue" | "city" | "country" | "ticketUrl" | "ticketStatus" | "cover"
> & { lineup: { name: string; format?: OutranceEvent["lineup"][number]["format"] }[] };

export function toAgendaEvent(e: OutranceEvent): AgendaEvent {
  const { slug, title, titlePrefix, date, start, end, venue, city, country, ticketUrl, ticketStatus, cover } = e;
  return {
    slug,
    title,
    titlePrefix,
    date,
    start,
    end,
    venue,
    city,
    country,
    ticketUrl,
    ticketStatus,
    cover,
    lineup: e.lineup.map(({ name, format }) => ({ name, format })),
  };
}

export type Country = "all" | "FR" | "BE";
export type View = "upcoming" | "archive";

export const COUNTRY_OPTIONS: { value: Country; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "FR", label: "Lyon" },
  { value: "BE", label: "Belgique" },
];

/** Libellé du tag pays d’une ligne d’archive (le filtre « Lyon » couvre tout country FR). */
export const COUNTRY_TAG = { FR: "Lyon", BE: "Belgique" } as const;

/** Paramètres d’URL : ?vue=archives&pays=fr|be (valeurs par défaut omises). */
export function parseView(v: string | null): View {
  return v === "archives" ? "archive" : "upcoming";
}
export function parseCountry(v: string | null): Country {
  return v === "fr" ? "FR" : v === "be" ? "BE" : "all";
}

/** « à Lyon », « en Belgique », ou rien pour « Tout ». */
export function countryPhrase(c: Country): string {
  return c === "FR" ? " à Lyon" : c === "BE" ? " en Belgique" : "";
}

/** Message de la région aria-live après un changement d’onglet ou de filtre. */
export function resultMessage(view: View, country: Country, count: number): string {
  const kind = view === "upcoming" ? "à venir" : "passé";
  const where = countryPhrase(country);
  if (count === 0) return `Aucun événement ${kind}${where}`;
  return `${count} événement${count > 1 ? "s" : ""} ${kind}${count > 1 && kind === "passé" ? "s" : ""}${where}`;
}

const NUMBERS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt",
];

/** Nombre d’années pleines depuis la fondation (« AAAA-MM »), en toutes lettres jusqu’à vingt. */
export function yearsSince(founded: string, now: Date): string {
  const [fy, fm] = founded.split("-").map(Number) as [number, number];
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "numeric" })
    .formatToParts(now)
    .reduce<Record<string, number>>((acc, p) => (p.type === "literal" ? acc : { ...acc, [p.type]: Number(p.value) }), {});
  const y = parts.year ?? fy;
  const m = parts.month ?? fm;
  const years = y - fy - (m < fm ? 1 : 0);
  return NUMBERS[years] ?? String(years);
}

/** « au Petit Salon », « à la Rayonne », « à Kultura »… d’après le lieu du tout premier événement. */
export function atVenue(venue: string): string {
  if (/^le\s/i.test(venue)) return `au ${venue.slice(3)}`;
  if (/^les\s/i.test(venue)) return `aux ${venue.slice(4)}`;
  if (/^la\s/i.test(venue)) return `à la ${venue.slice(3)}`;
  if (/^l[’']/i.test(venue)) return `à l’${venue.slice(2)}`;
  return `à ${venue}`;
}

/** Titre des textes de type « ttl » des maquettes (classe absente de theme.css). */
export const TTL = "font-display font-semibold uppercase leading-[1.15]";

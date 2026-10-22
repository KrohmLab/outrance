import type { Artist } from "../../content/schemas";

/** Date « Avec Outrance » d’un artiste (titre complété de « — vs X » pour un B2B). */
export type ArtistEvent = { slug: string; title: string; date: string };

export type RosterArtist = Artist & { events: ArtistEvent[] };

export type FormatFilter = "all" | Artist["format"];

/** « Psytrance/Forest/Psytech » */
export const genresLabel = (a: Pick<Artist, "genres">) => a.genres.join("/");

/** « de Klaak », « d’Originz » */
export function ofName(name: string): string {
  return /^[aeiouyàâäéèêëîïôöùûü]/i.test(name) ? `d’${name}` : `de ${name}`;
}

/** Libellés des liens externes d’un artiste, dans l’ordre d’affichage. */
export const LINK_LABELS = {
  soundcloud: "SoundCloud",
  instagram: "Instagram",
  facebook: "Facebook",
  bandcamp: "Bandcamp",
  youtube: "YouTube",
} as const satisfies Record<keyof Artist["links"], string>;

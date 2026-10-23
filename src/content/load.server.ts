// Chargement et validation des contenus, exécuté au build (loaders pré-rendus) : jamais envoyé au navigateur.
// Une erreur de validation lève une exception et fait échouer `npm run build`.
import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import aftermoviesJson from "../../content/aftermovies.json";
import artistsJson from "../../content/artists.json";
import facebookAlbumsJson from "../../content/facebook-albums.json";
import galerieJson from "../../content/galerie.json";
import legalJson from "../../content/legal.json";
import presseJson from "../../content/presse.json";
import siteJson from "../../content/site.json";
import teamJson from "../../content/team.json";
import timelineJson from "../../content/timeline.json";
import {
  aftermovieSchema,
  artistSchema,
  eventFrontmatterSchema,
  facebookAlbumSchema,
  facebookAlbumsOverrideSchema,
  galerieSchema,
  instagramPostSchema,
  legalSchema,
  presseSchema,
  siteSchema,
  teamSchema,
  timelineSchema,
  type Artist,
  type OutranceEvent,
} from "./schemas";

function validate<T extends z.ZodType>(schema: T, data: unknown, source: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join(".") || "(racine)"} : ${i.message}`).join("\n");
    throw new Error(`Contenu invalide dans ${source} :\n${issues}`);
  }
  return result.data;
}

export const site = validate(siteSchema, siteJson, "content/site.json");
export const artists: Artist[] = validate(artistSchema.array(), artistsJson, "content/artists.json");
export const aftermovies = validate(aftermovieSchema.array(), aftermoviesJson, "content/aftermovies.json");
export const galerie = validate(galerieSchema, galerieJson, "content/galerie.json");
export const legal = validate(legalSchema, legalJson, "content/legal.json");
export const presse = validate(presseSchema, presseJson, "content/presse.json");
export const team = validate(teamSchema, teamJson, "content/team.json");
export const timeline = validate(timelineSchema, timelineJson, "content/timeline.json");
const facebookAlbumsOverride = validate(facebookAlbumsOverrideSchema, facebookAlbumsJson, "content/facebook-albums.json");

// Contenus récupérés chez Meta par scripts/sync-meta.mjs ; absents sans jeton (placeholders).
const generated = import.meta.glob<unknown>("../../content/generated/*.json", { import: "default", eager: true });
const generatedFile = (name: string) => generated[`../../content/generated/${name}`] ?? [];

export const instagram = validate(instagramPostSchema.array(), generatedFile("instagram.json"), "content/generated/instagram.json");
const facebookAlbums = validate(facebookAlbumSchema.array(), generatedFile("facebook-albums.json"), "content/generated/facebook-albums.json");

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

const eventFiles = import.meta.glob<string>("../../content/events/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Associe les noms du line-up aux artistes du roster ; « Originz vs Rayzorks » donne deux artistes. */
function rosterSlugsFor(lineup: { name: string }[]): string[] {
  const byName = new Map(artists.map((a) => [a.name.toLowerCase(), a.slug]));
  const slugs = lineup.flatMap((item) =>
    item.name
      .split(/\s+(?:vs\.?|b2b|&)\s+/i)
      .map((part) => byName.get(part.trim().toLowerCase()))
      .filter((slug): slug is string => Boolean(slug)),
  );
  return [...new Set(slugs)];
}

function loadEvents(): OutranceEvent[] {
  const events: OutranceEvent[] = [];
  const slugs = new Set<string>();

  for (const [path, raw] of Object.entries(eventFiles)) {
    const source = path.replace(/^(\.\.\/)+/, "");
    const match = FRONTMATTER.exec(raw);
    if (!match) throw new Error(`Frontmatter introuvable dans ${source}`);
    // Les dates sont gardées en chaînes (pas de conversion en Date UTC).
    const data = parseYaml(match[1] ?? "", { schema: "core" }) as unknown;
    const fm = validate(eventFrontmatterSchema, data, source);
    if (slugs.has(fm.slug)) throw new Error(`Slug d’événement en double : ${fm.slug} (${source})`);
    slugs.add(fm.slug);
    if (fm.draft || fm.date === null) continue;

    const body = (match[2] ?? "").replace(/<!--[\s\S]*?-->/g, "").trim();
    const { draft: _draft, ...rest } = fm;
    void _draft;
    events.push({
      ...rest,
      date: fm.date,
      bodyHtml: body ? (marked.parse(body, { async: false }) as string) : "",
      rosterSlugs: rosterSlugsFor(fm.lineup),
    });
  }

  // Du plus récent au plus ancien.
  return events.sort((a, b) => b.date.localeCompare(a.date) || (b.start ?? "").localeCompare(a.start ?? ""));
}

export const events = loadEvents();

// Chiffre « Événements » de l’association : toujours le nombre d’événements publiés.
for (const stat of site.stats) {
  if (stat.label === "Événements") stat.value = events.length;
}

for (const album of galerie.albums) {
  if (!events.some((e) => e.slug === album.event)) {
    throw new Error(`content/galerie.json : l’album « ${album.title} » pointe vers un événement inconnu (${album.event})`);
  }
}
for (const [id, slug] of Object.entries(facebookAlbumsOverride.albums)) {
  if (slug !== null && !events.some((e) => e.slug === slug)) {
    throw new Error(`content/facebook-albums.json : l’album ${id} pointe vers un événement inconnu (${slug})`);
  }
}

// Albums Facebook : les photos d’un même événement s’ajoutent à son album (créé au besoin) ; les photos
// déposées à la main dans content/galerie.json passent en premier.
for (const fb of facebookAlbums) {
  const event = getEvent(fb.event);
  if (!event || fb.photos.length === 0) continue;
  let album = galerie.albums.find((a) => a.event === fb.event);
  if (!album) {
    album = { event: event.slug, title: event.title, date: event.date, photographer: null, photos: [] };
    galerie.albums.push(album);
  }
  album.photos.push(...fb.photos.map((p) => ({ ...p, alt: p.alt || `${album.title}, photo de la soirée` })));
}
galerie.albums.sort((a, b) => b.date.localeCompare(a.date));

export function getEvent(slug: string): OutranceEvent | undefined {
  return events.find((e) => e.slug === slug);
}

/** Événements où joue un artiste du roster, du plus récent au plus ancien. */
export function eventsWithArtist(slug: string): OutranceEvent[] {
  return events.filter((e) => e.rosterSlugs.includes(slug));
}

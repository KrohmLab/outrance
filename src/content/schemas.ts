// Schémas des contenus de content/. Stricts : un champ inconnu ou mal typé fait échouer le build.
// Les champs à null sont des placeholders « À COMPLÉTER » : l’interface ne les invente jamais.
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date attendue au format AAAA-MM-JJ");
const time = z.string().regex(/^\d{2}:\d{2}$/, "heure attendue au format HH:MM");
const url = z.url();
const country = z.enum(["FR", "BE"]);
const nullable = <T extends z.ZodType>(schema: T) => schema.nullable().optional();

export const lineupItemSchema = z.strictObject({
  name: z.string().min(1),
  format: nullable(z.enum(["Live", "DJset", "B2B"])),
  genre: nullable(z.string()),
  label: nullable(z.string()),
  note: nullable(z.string()),
});

export const eventFrontmatterSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    titlePrefix: nullable(z.string()),
    date: isoDate.nullable(),
    start: nullable(time),
    end: nullable(time),
    venue: z.string().nullable(),
    city: z.string().nullable(),
    country,
    tagline: nullable(z.string()),
    genres: nullable(z.array(z.string())),
    lineup: z.array(lineupItemSchema),
    decoration: nullable(z.string()),
    price: nullable(z.string()),
    ticketUrl: nullable(url),
    /** Statut de billetterie optionnel, à poser par l’équipe : « Complet » ou « Dernières places ». */
    ticketStatus: nullable(z.enum(["soldOut", "lastSpots"])),
    facebookUrl: nullable(url),
    poster: nullable(z.string()),
    cover: nullable(z.string()),
    minors: nullable(z.boolean()),
    draft: z.boolean().optional(),
  })
  .refine((e) => e.draft || e.date !== null, { message: "un événement publié doit avoir une date" });

export const artistSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  format: z.enum(["DJset", "Live"]),
  genres: z.array(z.string()).min(1),
  bio: nullable(z.string()),
  photo: z.string().nullable(),
  links: z.strictObject({
    soundcloud: url.optional(),
    instagram: url.optional(),
    facebook: url.optional(),
    bandcamp: url.optional(),
    youtube: url.optional(),
  }),
});

export const aftermovieSchema = z.strictObject({
  title: z.string().min(1),
  text: z.string(),
  credit: z.string().nullable(),
  youtubeUrl: url.nullable(),
  /** Vignette servie par le site (public/), pour ne rien charger depuis YouTube avant le clic. */
  thumbnail: nullable(z.string()),
});

export const photoSchema = z.strictObject({
  src: z.string(),
  /** Version réduite pour les vignettes (albums Facebook) ; sinon `src`. */
  thumb: nullable(z.string()),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const galerieSchema = z.strictObject({
  albums: z.array(
    z.strictObject({
      event: z.string(),
      title: z.string(),
      date: isoDate,
      photographer: z.string().nullable(),
      photos: z.array(photoSchema),
    }),
  ),
  note: z.string().optional(),
});

/** Généré au build par scripts/sync-meta.mjs (content/generated/), jamais édité à la main. */
export const instagramPostSchema = z.strictObject({
  id: z.string(),
  permalink: url,
  image: z.string(),
  caption: z.string(),
  video: z.boolean(),
  date: z.string(),
});

export const facebookAlbumSchema = z.strictObject({
  event: z.string(),
  facebookId: z.string(),
  name: z.string(),
  photos: z.array(photoSchema),
});

export const facebookAlbumsOverrideSchema = z.strictObject({
  note: z.string().optional(),
  albums: z.record(z.string(), z.string().nullable()),
  /** Photos retirées sur demande (droit à l’image), par identifiant Facebook. */
  hiddenPhotos: z.array(z.string().regex(/^\d+$/, "identifiant Facebook : chiffres uniquement")).optional(),
});

export const legalSchema = z.strictObject({
  publisher: z.string(),
  address: z.string(),
  rna: z.string(),
  siren: z.string(),
  publicationDirector: z.string().nullable(),
  host: z.string(),
  /** Conception, développement et maintenance du site. */
  webmaster: z.string(),
  newsletterProvider: z.string().nullable(),
  todo: z.string().optional(),
});

export const presseSchema = z.strictObject({
  pressKitUrl: url,
  logosUrl: url,
  blurbs: z.strictObject({ short: z.string(), long: z.string() }),
  contacts: z.array(z.strictObject({ label: z.string(), email: z.email() })),
  venues: z.array(z.string()),
});

export const teamSchema = z.array(z.strictObject({ name: z.string(), role: z.string(), email: z.email(), photo: nullable(z.string()) }));

export const timelineSchema = z.array(
  z.strictObject({ date: isoDate, label: z.string(), title: z.string(), text: z.string() }),
);

const navItem = z.strictObject({ label: z.string(), href: z.string(), external: z.boolean().optional() });

export const siteSchema = z.strictObject({
  name: z.string(),
  tagline: z.string(),
  url: url,
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  emails: z.strictObject({ contact: z.email(), booking: z.email() }),
  socials: z.strictObject({ instagram: url, facebook: url, soundcloud: url, youtube: url, shotgun: url }),
  belgiumUrl: url,
  association: z.strictObject({
    founded: z.string().regex(/^\d{4}-\d{2}$/),
    legalForm: z.string(),
    city: z.string(),
    belgiumSince: z.number().int(),
    intro: z.string(),
    story: z.array(z.string()),
  }),
  stats: z.array(z.strictObject({ value: z.number().nullable(), label: z.string(), todo: z.string().optional() })),
  newsletter: z.strictObject({ title: z.string(), text: z.string(), provider: z.string().nullable() }),
  footer: z.strictObject({ credit: z.string(), creditUrl: url }),
  legacyRedirects: z.record(z.string(), z.string()),
  nav: z.array(navItem),
  footerNav: z.array(navItem),
});

export type LineupItem = z.infer<typeof lineupItemSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type Aftermovie = z.infer<typeof aftermovieSchema>;
export type Galerie = z.infer<typeof galerieSchema>;
export type InstagramPost = z.infer<typeof instagramPostSchema>;
export type Album = Galerie["albums"][number];
export type Photo = z.infer<typeof photoSchema>;
/** Album sans ses photos, pour la mosaïque : les photos sont chargées à l’ouverture (/galerie/albums/{slug}.json). */
export type AlbumSummary = Omit<Album, "photos"> & { cover: Photo | null; count: number };
export type Legal = z.infer<typeof legalSchema>;
export type Presse = z.infer<typeof presseSchema>;
export type TeamMember = z.infer<typeof teamSchema>[number];
export type TimelineStep = z.infer<typeof timelineSchema>[number];

/** Événement publié, prêt pour l’interface (date garantie, corps Markdown rendu en HTML). */
export type OutranceEvent = Omit<z.infer<typeof eventFrontmatterSchema>, "date" | "draft"> & {
  date: string;
  /** HTML du corps Markdown, vide si le corps n’est qu’un commentaire. */
  bodyHtml: string;
  /** Slugs des artistes du roster présents dans le line-up (B2B « X vs Y » découpés). */
  rosterSlugs: string[];
};

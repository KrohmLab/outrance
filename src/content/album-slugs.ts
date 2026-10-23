// Albums qui ont des photos (saisies à la main ou récupérées sur Facebook par scripts/sync-meta.mjs).
// Lu en Node par react-router.config.ts et routes.ts, avant le build : jamais envoyé au navigateur.
import { readFileSync } from "node:fs";

type RawAlbum = { event: string; photos: unknown[] };

function read(path: string): unknown {
  try {
    return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
  } catch {
    return null;
  }
}

export function albumSlugs(): string[] {
  const manual = ((read("../../content/galerie.json") as { albums?: RawAlbum[] } | null)?.albums ?? []) as RawAlbum[];
  const facebook = (read("../../content/generated/facebook-albums.json") ?? []) as RawAlbum[];
  return [...new Set([...manual, ...facebook].filter((a) => a.photos.length > 0).map((a) => a.event))];
}

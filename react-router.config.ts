import type { Config } from "@react-router/dev/config";
import { readdir, readFile } from "node:fs/promises";
import { parse } from "yaml";

/** Slugs des événements publiés (hors brouillons), pour pré-rendre chaque fiche. */
async function eventSlugs(): Promise<string[]> {
  const dir = new URL("./content/events/", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const slugs: string[] = [];
  for (const file of files) {
    const raw = await readFile(new URL(file, dir), "utf8");
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1];
    const data = fm ? (parse(fm) as { slug?: string; draft?: boolean; date?: unknown }) : null;
    if (data?.slug && !data.draft && data.date) slugs.push(data.slug);
  }
  return slugs;
}

/** Albums qui ont des photos (saisies à la main ou récupérées sur Facebook), pour pré-rendre leur JSON. */
async function albumSlugs(): Promise<string[]> {
  const read = async (path: string) => {
    try {
      return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8")) as unknown;
    } catch {
      return null;
    }
  };
  const manual = ((await read("./content/galerie.json")) as { albums: { event: string; photos: unknown[] }[] }).albums;
  const facebook = ((await read("./content/generated/facebook-albums.json")) ?? []) as { event: string; photos: unknown[] }[];
  return [...new Set([...manual, ...facebook].filter((a) => a.photos.length > 0).map((a) => a.event))];
}

export default {
  appDirectory: "src",
  // Site 100 % statique : chaque route est pré-rendue au build, aucun serveur à l’exécution.
  ssr: false,
  async prerender({ getStaticPaths }) {
    // "/404" est rendu par la route joker (*) puis copié en build/client/404.html
    // par scripts/postbuild.mjs : Cloudflare le sert avec un statut 404.
    const slugs = await eventSlugs();
    const albums = await albumSlugs();
    return [
      ...getStaticPaths(),
      ...slugs.map((s) => `/evenements/${s}`),
      ...albums.map((s) => `/galerie/albums/${s}.json`),
      "/404",
    ];
  },
} satisfies Config;

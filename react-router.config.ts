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

export default {
  appDirectory: "src",
  // Site 100 % statique : chaque route est pré-rendue au build, aucun serveur à l’exécution.
  ssr: false,
  async prerender({ getStaticPaths }) {
    // "/404" est rendu par la route joker (*) puis copié en build/client/404.html
    // par scripts/postbuild.mjs : Cloudflare le sert avec un statut 404.
    const slugs = await eventSlugs();
    return [...getStaticPaths(), ...slugs.map((s) => `/evenements/${s}`), "/404"];
  },
} satisfies Config;

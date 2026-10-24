// Après le build : sitemap.xml (toutes les pages pré-rendues sauf la 404), robots.txt et _redirects
// (anciennes URL WordPress → nouvelles pages, depuis content/site.json → legacyRedirects, en 301).
import { readdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const client = new URL("build/client/", root);
const site = JSON.parse(await readFile(new URL("content/site.json", root), "utf8"));
const origin = site.url.replace(/\/$/, "");

// Pages = dossiers contenant un index.html (pré-rendu de React Router).
async function pages(dir, prefix = "") {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || ["assets", "og"].includes(entry.name)) continue;
    const sub = new URL(`${entry.name}/`, dir);
    const path = `${prefix}/${entry.name}`;
    if ((await readdir(sub)).includes("index.html")) found.push(path);
    found.push(...(await pages(sub, path)));
  }
  return found;
}

// Pages non indexées (noindex) : jamais dans le sitemap.
const NOINDEX = new Set(["/newsletter", "/newsletter/confirmee"]);
const paths = ["/", ...(await pages(client)).filter((p) => !NOINDEX.has(p)).sort()];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p === "/" ? "/" : p}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(new URL("sitemap.xml", client), xml);

await writeFile(new URL("robots.txt", client), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);

const redirects = Object.entries(site.legacyRedirects).map(([from, to]) => `${from} ${to} 301`);
await writeFile(new URL("_redirects", client), `# Anciennes URL WordPress (content/site.json → legacyRedirects)\n${redirects.join("\n")}\n`);

console.log(`seo: sitemap (${paths.length} pages), robots.txt, _redirects (${redirects.length} règles)`);

// Après `react-router build` : expose la page 404 pré-rendue là où Cloudflare l’attend.
import { copyFile, readdir, rm } from "node:fs/promises";

const client = new URL("../build/client/", import.meta.url);

await copyFile(new URL("404/index.html", client), new URL("404.html", client));
await rm(new URL("404", client), { recursive: true });
await rm(new URL("404.data", client), { force: true });
// Le build est entièrement pré-rendu : le fallback SPA ne doit jamais être servi.
await rm(new URL("__spa-fallback.html", client), { force: true });

// Les photos d’album sont des fichiers JSON chargés par fetch : leurs données de navigation sont inutiles.
const albums = new URL("galerie/albums/", client);
for (const file of await readdir(albums).catch(() => [])) {
  if (file.endsWith(".data")) await rm(new URL(file, albums));
}

console.log("postbuild: build/client/404.html prêt");

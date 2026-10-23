// Avant `react-router build` : récupère les dernières publications Instagram et les albums photo de la
// page Facebook, copie les images dans public/meta/ (servies par le site, aucun appel à Meta chez le
// visiteur) et écrit content/generated/*.json, lus par le loader de contenu.
//
// Un seul secret : META_PAGE_TOKEN, jeton de la page Facebook (sans expiration, voir docs/meta.md).
// Le compte Instagram professionnel doit être relié à cette page. Sans jeton, ou si Meta répond mal,
// le build continue sans ces contenus : l’accueil et la galerie gardent leurs placeholders.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const GENERATED = new URL("content/generated/", ROOT);
const MEDIA = new URL("public/meta/", ROOT);
// META_GRAPH_URL sert seulement aux tests (faux serveur local).
const GRAPH = process.env.META_GRAPH_URL ?? `https://graph.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}`;
const TOKEN = process.env.META_PAGE_TOKEN;
const INSTAGRAM_POSTS = 6;

const log = (msg) => console.log(`sync-meta: ${msg}`);

async function graph(path, params = {}) {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("access_token", TOKEN);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new Error(body.error?.message ?? `HTTP ${res.status} sur ${path}`);
  return body;
}

/** Toutes les pages d’un résultat paginé du Graph API. */
async function graphAll(path, params) {
  const items = [];
  let body = await graph(path, params);
  for (;;) {
    items.push(...(body.data ?? []));
    const next = body.paging?.next;
    if (!next) return items;
    const res = await fetch(next, { signal: AbortSignal.timeout(20_000) });
    body = await res.json();
    if (!res.ok || body.error) throw new Error(body.error?.message ?? `HTTP ${res.status} (pagination)`);
  }
}

/** Télécharge une image une seule fois (le fichier déjà présent est gardé). */
async function download(src, file) {
  const target = new URL(file, MEDIA);
  if (existsSync(target)) return;
  const res = await fetch(src, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  await mkdir(new URL(".", target), { recursive: true });
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
}

/** Exécute les tâches avec au plus `n` en parallèle. */
async function pool(tasks, n = 8) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, tasks.length) }, async () => {
      while (i < tasks.length) {
        const k = i++;
        results[k] = await tasks[k]();
      }
    }),
  );
  return results;
}

async function writeJson(name, data) {
  await mkdir(GENERATED, { recursive: true });
  await writeFile(new URL(name, GENERATED), `${JSON.stringify(data, null, 2)}\n`);
}

// ---------------------------------------------------------------- Instagram

async function syncInstagram(pageId) {
  const page = await graph(pageId, { fields: "instagram_business_account" });
  const igId = page.instagram_business_account?.id;
  if (!igId) throw new Error("aucun compte Instagram professionnel relié à la page Facebook");
  const { data = [] } = await graph(`${igId}/media`, {
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    limit: INSTAGRAM_POSTS,
  });
  const posts = [];
  for (const m of data) {
    const src = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
    if (!src) continue;
    await download(src, `instagram/${m.id}.jpg`);
    posts.push({
      id: m.id,
      permalink: m.permalink,
      image: `/meta/instagram/${m.id}.jpg`,
      caption: (m.caption ?? "").trim(),
      video: m.media_type === "VIDEO",
      date: m.timestamp,
    });
  }
  await writeJson("instagram.json", posts);
  log(`${posts.length} publications Instagram`);
}

// ---------------------------------------------------------------- Albums Facebook

const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .trim();

/** slug, titre et date de chaque événement, lus dans le frontmatter (sans dépendance). */
async function readEvents() {
  const dir = new URL("content/events/", ROOT);
  const events = [];
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".md")) continue;
    const text = await readFile(new URL(file, dir), "utf8");
    const field = (k) => new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, "m").exec(text)?.[1] ?? null;
    if (field("draft") === "true" || !field("slug") || !field("date")) continue;
    const title = field("title") ?? "";
    const prefix = field("titlePrefix");
    // Le préfixe est parfois le line-up (« Ital • Aho… ») : le titre seul suffit à reconnaître l’album.
    events.push({ slug: field("slug"), titles: prefix ? [title, `${prefix} ${title}`] : [title], date: field("date") });
  }
  return events;
}

const DAY = 86_400_000;

/**
 * Événement d’un album : choix manuel (content/facebook-albums.json) sinon titre de l’événement présent
 * dans le nom de l’album, en prenant l’édition la plus proche de la date de l’album (≤ 120 jours).
 */
function matchEvent(album, events, overrides) {
  if (album.id in overrides) return overrides[album.id];
  const name = ` ${norm(album.name ?? "")} `;
  const created = Date.parse(album.created_time);
  let best = null;
  for (const e of events) {
    const t = e.titles.map(norm).filter((x) => x && name.includes(` ${x} `)).sort((a, b) => b.length - a.length)[0];
    if (!t) continue;
    const gap = Math.abs(created - Date.parse(e.date)) / DAY;
    if (gap > 120) continue;
    // À écart égal, le titre le plus long (le plus précis) l’emporte : « Outrance #12 » avant « Outrance ».
    const score = gap - t.length / 1000;
    if (!best || score < best.score) best = { slug: e.slug, score };
  }
  return best?.slug ?? null;
}

/** Plus grande version ≤ 2048 px pour la visionneuse, plus petite ≥ 480 px pour les vignettes. */
function pickSizes(images) {
  const bySize = [...images].sort((a, b) => b.width - a.width);
  const full = bySize.find((i) => Math.max(i.width, i.height) <= 2048) ?? bySize.at(-1);
  const thumb = [...bySize].reverse().find((i) => i.width >= 480) ?? full;
  return { full, thumb };
}

async function syncAlbums(pageId) {
  const overridesFile = new URL("content/facebook-albums.json", ROOT);
  const overrides = existsSync(overridesFile) ? JSON.parse(await readFile(overridesFile, "utf8")).albums ?? {} : {};
  const events = await readEvents();
  const albums = await graphAll(`${pageId}/albums`, { fields: "id,name,created_time,count,type", limit: 100 });

  const out = [];
  const ignored = [];
  for (const album of albums) {
    if (album.type && album.type !== "normal") continue; // photos de profil, couvertures, mobile…
    const slug = matchEvent(album, events, overrides);
    if (!slug) {
      ignored.push(`${album.id} « ${album.name} »`);
      continue;
    }
    const photos = await graphAll(`${album.id}/photos`, { fields: "id,images,name", limit: 100 });
    const items = await pool(
      photos.map((p) => async () => {
        const { full, thumb } = pickSizes(p.images ?? []);
        if (!full) return null;
        try {
          await download(full.source, `facebook/${album.id}/${p.id}.jpg`);
          if (thumb !== full) await download(thumb.source, `facebook/${album.id}/${p.id}-t.jpg`);
        } catch (err) {
          log(`photo ${p.id} ignorée (${err.message})`);
          return null;
        }
        return {
          src: `/meta/facebook/${album.id}/${p.id}.jpg`,
          thumb: thumb !== full ? `/meta/facebook/${album.id}/${p.id}-t.jpg` : null,
          alt: (p.name ?? "").trim().slice(0, 140),
          width: full.width,
          height: full.height,
        };
      }),
    );
    out.push({ event: slug, facebookId: album.id, name: album.name, photos: items.filter(Boolean) });
  }
  await writeJson("facebook-albums.json", out);
  log(`${out.length} albums Facebook rattachés à un événement, ${out.reduce((n, a) => n + a.photos.length, 0)} photos`);
  if (ignored.length) log(`albums sans événement (ignorés) :\n  ${ignored.join("\n  ")}`);
}

// ---------------------------------------------------------------- Lancement

if (!TOKEN) {
  log("META_PAGE_TOKEN absent : publications Instagram et albums Facebook ignorés (placeholders)");
  await rm(GENERATED, { recursive: true, force: true });
} else {
  let pageId = process.env.META_PAGE_ID;
  try {
    pageId ??= (await graph("me", { fields: "id" })).id;
  } catch (err) {
    log(`jeton refusé par Meta (${err.message}) : rien n’est synchronisé`);
  }
  if (pageId) {
    for (const [label, run] of [
      ["Instagram", syncInstagram],
      ["albums Facebook", syncAlbums],
    ]) {
      try {
        await run(pageId);
      } catch (err) {
        log(`${label} non synchronisés : ${err.message}`);
      }
    }
  }
}

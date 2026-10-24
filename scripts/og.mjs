// Images de partage (Open Graph, 1200×630) générées au build : une générale et une par événement publié.
// satori dessine la mise en page en SVG, resvg la convertit en PNG. Aucune donnée inventée : titre,
// date, lieu et line-up viennent de content/. Remplacées par les vrais visuels quand ils existeront.
import { Resvg } from "@resvg/resvg-js";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import satori from "satori";
import { parse } from "yaml";
import { formatDate } from "../src/lib/dates.ts";

const root = new URL("../", import.meta.url);
const out = new URL("build/client/og/", root);
const W = 1200;
const H = 630;
const C = { nuit: "#0a0712", line: "#2e2645", ink: "#f4f0fb", muted: "#a99fc2", lotus: "#b98bff", deep: "#2a1652" };

const font = (pkg, file) => readFile(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, root));
const fonts = [
  { name: "Unbounded", data: await font("unbounded", "unbounded-latin-800-normal.woff"), weight: 800 },
  { name: "Manrope", data: await font("manrope", "manrope-latin-600-normal.woff"), weight: 600 },
  { name: "JetBrains Mono", data: await font("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"), weight: 500 },
];
const logo = `data:image/png;base64,${(await readFile(new URL("assets/logo/outrance-logo-white.png", root))).toString("base64")}`;
const site = JSON.parse(await readFile(new URL("content/site.json", root), "utf8"));

// Pétales du lotus ouvert (src/components/lotus-paths.ts), en motif sur la droite.
const pathsSrc = await readFile(new URL("src/components/lotus-paths.ts", root), "utf8");
const bloom = [...pathsSrc.slice(pathsSrc.indexOf("BLOOM_PATHS")).matchAll(/"(M[^"]+)"/g)].map((m) => m[1]);
const lotusSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -300 600 600" width="760" height="760">
  <g fill="none" stroke="${C.lotus}">
    <circle r="150" stroke-opacity=".35"/><circle r="220" stroke-opacity=".22" stroke-dasharray="2 7"/><circle r="290" stroke-opacity=".12"/>
  </g>
  <g transform="rotate(45)" stroke="${C.lotus}" stroke-width="1.6">
    <path d="${bloom[0]}" fill="${C.lotus}" fill-opacity=".05" stroke-opacity=".85"/>
    <path d="${bloom[1]}" fill="${C.deep}" fill-opacity=".55"/>
    <path d="${bloom[2]}" fill="${C.deep}"/>
  </g>
  <circle r="9" fill="${C.lotus}"/>
</svg>`;
const lotusUri = `data:image/svg+xml;base64,${Buffer.from(lotusSvg).toString("base64")}`;

const h = (type, style, children) => ({ type, props: { style, children } });
const img = (src, style) => ({ type: "img", props: { src, style } });

async function render(node, file, width = W, height = H) {
  const svg = await satori(node, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
  await writeFile(file, png);
}

const frame = (content, lotusOpacity = 0.9) =>
  h("div", { width: W, height: H, display: "flex", position: "relative", background: C.nuit, overflow: "hidden" }, [
    img(lotusUri, { position: "absolute", right: -190, top: -65, width: 760, height: 760, opacity: lotusOpacity }),
    content,
  ]);

// Image générale.
await mkdir(new URL("evenements/", out), { recursive: true });
await render(
  frame(
    h("div", { display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, padding: "0 72px", width: 720 }, [
      img(logo, { width: 560, height: Math.round((560 * 233) / 1600) }),
      h("div", { fontFamily: "JetBrains Mono", fontSize: 16, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }, `${site.tagline} — Lyon & Belgium since ${site.association.founded.slice(0, 4)}`),
      h("div", { fontFamily: "Manrope", fontSize: 25, color: C.ink, lineHeight: 1.4, maxWidth: 600 }, site.metaDescription),
    ]),
    0.75,
  ),
  new URL("outrance.png", out),
);

// En-tête des e-mails beehiiv (confirmation d’inscription…), sur le fond nuit-raised du message.
// Adresse stable : /og/email-entete.png, importée dans beehiiv par son URL.
await render(
  h("div", { width: W, height: 400, display: "flex", position: "relative", background: "#161022", overflow: "hidden" }, [
    img(lotusUri, { position: "absolute", right: -230, top: -180, width: 760, height: 760, opacity: 0.7 }),
    h("div", { display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, padding: "0 72px", width: 760 }, [
      img(logo, { width: 600, height: Math.round((600 * 233) / 1600) }),
      h("div", { fontFamily: "JetBrains Mono", fontSize: 20, letterSpacing: 4, color: C.lotus, textTransform: "uppercase" }, "Newsletter"),
    ]),
  ]),
  new URL("email-entete.png", out),
  W,
  400,
);

// Une image par événement publié.
const dir = new URL("content/events/", root);
let count = 1;
for (const file of await readdir(dir)) {
  if (!file.endsWith(".md")) continue;
  const raw = await readFile(new URL(file, dir), "utf8");
  const fm = parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? "", { schema: "core" });
  if (fm.draft || !fm.date) continue;
  const title = (fm.titlePrefix ? `${fm.titlePrefix} ${fm.title}` : fm.title).toUpperCase();
  const place = [fm.venue, fm.city].filter(Boolean).join(", ");
  const names = (fm.lineup ?? []).map((l) => l.name).join(" · ");
  const size = title.length > 28 ? 56 : title.length > 18 ? 68 : 80;
  await render(
    frame(
      h("div", { display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 840, height: H }, [
        img(logo, { width: 220, height: Math.round((220 * 233) / 1600) }),
        h("div", { display: "flex", flexDirection: "column", gap: 22 }, [
          h("div", { fontFamily: "JetBrains Mono", fontSize: 24, letterSpacing: 3, color: C.lotus, textTransform: "uppercase" }, [formatDate(fm.date), place].filter(Boolean).join(" — ")),
          h("div", { fontFamily: "Unbounded", fontSize: size, lineHeight: 0.95, color: C.ink, letterSpacing: -1 }, title),
          names ? h("div", { fontFamily: "Manrope", fontSize: 24, lineHeight: 1.4, color: C.muted }, names.length > 110 ? `${names.slice(0, 107)}…` : names) : h("div", {}, ""),
        ]),
        h("div", { fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 5, color: C.muted, textTransform: "uppercase" }, site.tagline),
      ]),
    ),
    new URL(`evenements/${fm.slug}.png`, out),
  );
  count++;
}
console.log(`og: ${count} images de partage générées`);

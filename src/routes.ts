import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("agenda", "routes/agenda.tsx"),
  route("evenements/:slug", "routes/evenement.tsx"),
  route("artistes", "routes/artistes.tsx"),
  route("galerie", "routes/galerie.tsx"),
  // Photos d’un album en JSON, pré-rendues en fichiers statiques (/galerie/albums/{slug}.json).
  route("galerie/albums/:file", "routes/galerie-album.ts"),
  route("association", "routes/association.tsx"),
  route("presse-pro", "routes/presse-pro.tsx"),
  route("mentions-legales", "routes/mentions-legales.tsx"),
  // Route joker : toute URL inconnue. Pré-rendue sous /404 (voir react-router.config.ts).
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

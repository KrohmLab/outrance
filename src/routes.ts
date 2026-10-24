import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { albumSlugs } from "./content/album-slugs";

export default [
  index("routes/home.tsx"),
  route("agenda", "routes/agenda.tsx"),
  route("evenements/:slug", "routes/evenement.tsx"),
  route("artistes", "routes/artistes.tsx"),
  route("galerie", "routes/galerie.tsx"),
  // Photos d’un album en JSON, pré-rendues en fichiers statiques (/galerie/albums/{slug}.json).
  // Seulement s’il y a des albums : en mode statique, une route à loader doit avoir au moins une page pré-rendue.
  ...(albumSlugs().length > 0 ? [route("galerie/albums/:file", "routes/galerie-album.ts")] : []),
  route("association", "routes/association.tsx"),
  route("presse-pro", "routes/presse-pro.tsx"),
  route("mentions-legales", "routes/mentions-legales.tsx"),
  // Arrivée depuis l’e-mail de confirmation de la newsletter (beehiiv), non indexée.
  route("newsletter/confirmee", "routes/newsletter-confirmee.tsx"),
  // Route joker : toute URL inconnue. Pré-rendue sous /404 (voir react-router.config.ts).
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

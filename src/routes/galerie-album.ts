import { galerie } from "../content/load.server";
import type { Route } from "./+types/galerie-album";

// Photos d’un album (/galerie/albums/{slug}.json), pré-rendues en fichiers JSON statiques :
// la visionneuse les charge à l’ouverture au lieu de les embarquer dans la page Galerie.
export function loader({ params }: Route.LoaderArgs) {
  const slug = params.file.replace(/\.json$/, "");
  const album = galerie.albums.find((a) => a.event === slug && a.photos.length > 0);
  if (!album || !params.file.endsWith(".json")) throw new Response("Album introuvable", { status: 404 });
  return Response.json(album.photos);
}

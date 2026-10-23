import { galerie } from "../content/load.server";
// Types génériques : la route n’est déclarée que s’il y a des albums (src/routes.ts), donc pas toujours typegen.
import type { LoaderFunctionArgs } from "react-router";

// Photos d’un album (/galerie/albums/{slug}.json), pré-rendues en fichiers JSON statiques :
// la visionneuse les charge à l’ouverture au lieu de les embarquer dans la page Galerie.
export function loader({ params }: LoaderFunctionArgs) {
  const file = params.file ?? "";
  const slug = file.replace(/\.json$/, "");
  const album = galerie.albums.find((a) => a.event === slug && a.photos.length > 0);
  if (!album || !file.endsWith(".json")) throw new Response("Album introuvable", { status: 404 });
  return Response.json(album.photos);
}

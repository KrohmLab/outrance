import { useEffect } from "react";
import { useSearchParams, type ShouldRevalidateFunctionArgs } from "react-router";
import { AftermovieCard, useVideoPlayer, VideoPlayer } from "../components/Aftermovies";
import { AlbumMosaic } from "../components/galerie/AlbumMosaic";
import { PhotoViewer, usePhotoViewer } from "../components/galerie/PhotoViewer";
import { PageHeader } from "../components/PageHeader";
import { TabPanel, Tabs, useTabIds } from "../components/Tabs";
import { aftermovies, galerie } from "../content/load.server";
import { useHydrated } from "../lib/useHydrated";
import { site } from "../site";
import type { Route } from "./+types/galerie";

export const meta: Route.MetaFunction = () => [
  { title: `Galerie — ${site.name}` },
  {
    name: "description",
    content: "Photos et aftermovies des soirées psytrance Outrance, à Lyon et en Belgique, vues par nos photographes et vidéastes.",
  },
];

export function loader() {
  return { albums: galerie.albums, aftermovies };
}

// L’onglet et l’album ouvert vivent dans l’URL (lus côté client) : pas besoin de recharger les données.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

type Tab = "photos" | "aftermovies";

export default function Galerie({ loaderData }: Route.ComponentProps) {
  const { albums, aftermovies: movies } = loaderData;
  const [params, setParams] = useSearchParams();
  const hydrated = useHydrated();
  // Le pré-rendu produit l’onglet Photos ; l’URL n’est lue qu’après l’hydratation.
  const tab: Tab = hydrated && params.get("onglet") === "aftermovies" ? "aftermovies" : "photos";
  const ids = useTabIds("galerie");
  const viewer = usePhotoViewer();
  const player = useVideoPlayer();

  const updateParams = (edit: (p: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        edit(p);
        return p;
      },
      { replace: true, preventScrollReset: true },
    );

  // Lien direct vers un album : /galerie?album={slug-événement}&photo={n}, ouvert une fois après l’hydratation.
  useEffect(() => {
    if (!hydrated) return;
    const album = albums.find((a) => a.event === params.get("album"));
    if (album && album.photos.length > 0) viewer.open(album, Number(params.get("photo") ?? 1) - 1 || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const closeViewer = () => {
    viewer.props.onClose();
    if (params.has("album")) {
      updateParams((p) => {
        p.delete("album");
        p.delete("photo");
      });
    }
  };

  return (
    <>
      <PageHeader
        label="Photos et vidéos"
        title="Galerie"
        intro={
          <p className="m-0">
            Les nuits Outrance vues par nos photographes et vidéastes. Tu t’es reconnu&#8239;? Identifie-nous sur{" "}
            <a href={site.socials.instagram} target="_blank" rel="noopener">
              Instagram
            </a>
            .
          </p>
        }
      >
        <Tabs<Tab>
          label="Type de média"
          ids={ids}
          value={tab}
          onChange={(value) =>
            updateParams((p) => {
              if (value === "aftermovies") p.set("onglet", value);
              else p.delete("onglet");
            })
          }
          tabs={[
            { value: "photos", label: "Photos", count: albums.length },
            { value: "aftermovies", label: "Aftermovies", count: movies.length },
          ]}
          className="-mt-4 border-b border-line sm:mt-0"
        />
      </PageHeader>

      <TabPanel ids={ids} value="photos" active={tab === "photos"}>
        <section className="wrap pt-2 pb-16 sm:pt-0 sm:pb-24" aria-labelledby="galerie-albums">
          <h2 id="galerie-albums" className="sr-only">
            Albums photo
          </h2>
          <AlbumMosaic albums={albums} onOpen={(album) => viewer.open(album)} />
        </section>
      </TabPanel>

      <TabPanel ids={ids} value="aftermovies" active={tab === "aftermovies"}>
        <section className="wrap pt-2 pb-16 sm:pt-0 sm:pb-24" aria-labelledby="galerie-aftermovies">
          <h2 id="galerie-aftermovies" className="sr-only">
            Aftermovies
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3 p-0 sm:gap-6">
            {movies.map((movie) => (
              <li key={movie.title} className="flex">
                <AftermovieCard movie={movie} onOpen={() => player.open(movie)} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      </TabPanel>

      <PhotoViewer {...viewer.props} onClose={closeViewer} />
      <VideoPlayer {...player.props} />
    </>
  );
}

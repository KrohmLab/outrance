import type { Aftermovie } from "../../content/schemas";
import { AftermovieCard, VideoPlayer, useVideoPlayer } from "../Aftermovies";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

// Aftermovies (#aftermovies) : grille en desktop, rail horizontal aimanté en tablette et mobile.
// Cartes et lecteur partagés avec la Galerie (YouTube chargé seulement au clic).
const GUTTER = "clamp(16px,4vw,48px)";

export function AftermoviesSection({ movies }: { movies: Aftermovie[] }) {
  const player = useVideoPlayer();
  if (movies.length === 0) return null;

  return (
    <section id="aftermovies" aria-labelledby="aftermovies-titre" className="border-t border-line">
      <div className="flex flex-col gap-5 py-14 sm:gap-7 sm:py-20 lg:gap-10 lg:py-24">
        <SectionHeading id="aftermovies-titre" label="En images" title="Aftermovies" className="wrap" />
        <Reveal
          as="ul"
          style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto py-1.5 [scrollbar-width:none] sm:gap-4 lg:wrap lg:grid lg:snap-none lg:grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] lg:gap-6 lg:overflow-visible lg:py-0 [&::-webkit-scrollbar]:hidden"
        >
          {movies.map((m) => (
            <li key={m.title} className="flex w-[290px] flex-none snap-start sm:w-[340px] lg:w-auto">
              <AftermovieCard movie={m} onOpen={() => player.open(m)} className="w-full" />
            </li>
          ))}
        </Reveal>
      </div>
      <VideoPlayer {...player.props} />
    </section>
  );
}

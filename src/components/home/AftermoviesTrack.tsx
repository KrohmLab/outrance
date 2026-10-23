import { useLayoutEffect, useRef } from "react";
import type { Aftermovie } from "../../content/schemas";
import type { MotionLevel } from "../../lib/useMotionLevel";
import { AftermovieCard, VideoPlayer, useVideoPlayer } from "../Aftermovies";
import { clamp01 } from "./motion-math";
import { usePageScroll } from "./usePageScroll";

// Aftermovies : en desktop, la section se fige et les cartes défilent à l’horizontale avec le scroll,
// le titre se remplit de lotus et une barre suit la progression. Tablette et mobile : rail aimanté.
export function AftermoviesTrack({ movies, level }: { movies: Aftermovie[]; level: MotionLevel }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const player = useVideoPlayer();
  const stickyRef = useRef<HTMLDivElement>(null);
  const pinned = level === "full";

  // Figée, la section centre son contenu dans un écran entier : le vide au-dessus du titre
  // s’ajoutait à la marge du roster. On remonte la section d’autant (moins une marge de 40 px) ;
  // le haut du bloc figé, vide, laisse passer les clics vers le roster qu’il chevauche.
  useLayoutEffect(() => {
    const el = ref.current;
    const sticky = stickyRef.current;
    if (!el || !sticky) return;
    if (!pinned) {
      el.style.marginTop = "";
      return;
    }
    const fit = () => {
      const empty = (sticky.firstElementChild as HTMLElement | null)?.offsetTop ?? 0;
      el.style.marginTop = `${-Math.max(0, empty - 40)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [pinned]);

  usePageScroll(
    ref,
    (st, top, vh) => {
      const el = ref.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const pa = clamp01((st - top) / Math.max(1, el.offsetHeight - vh));
      const overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translateX(${(-pa * overflow).toFixed(1)}px)`;
      if (fillRef.current) fillRef.current.style.clipPath = `inset(0 ${((1 - pa) * 100).toFixed(1)}% 0 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pa.toFixed(3)})`;
    },
    pinned,
  );

  return (
    <section ref={ref} aria-labelledby="home-aftermovies" className={`relative ${pinned ? "h-[255vh]" : ""}`}>
      <div
        ref={stickyRef}
        className={`flex flex-col justify-center gap-6 py-12 sm:gap-10 sm:py-24 ${pinned ? "pointer-events-none sticky top-0 h-[100vh] overflow-hidden py-0! *:pointer-events-auto" : ""}`}
      >
        <div className="wrap relative">
          <span className="lbl text-lotus">Galerie</span>
          <div className="relative">
            <h2 id="home-aftermovies" className="disp mt-2 text-[clamp(28px,9.2vw,120px)] leading-none font-extrabold text-transparent [-webkit-text-stroke:1.2px_var(--color-border)]">
              Aftermovies
            </h2>
            <span
              ref={fillRef}
              aria-hidden="true"
              className="disp absolute top-0 left-0 mt-2 text-[clamp(28px,9.2vw,120px)] leading-none font-extrabold text-lotus"
              style={{ clipPath: pinned ? "inset(0 100% 0 0)" : undefined }}
            >
              Aftermovies
            </span>
          </div>
        </div>
        <ul
          ref={trackRef}
          className={`m-0 flex list-none gap-4 p-0 lg:gap-8 ${
            pinned
              ? "w-max px-[clamp(16px,4vw,128px)]"
              : "snap-x snap-mandatory overflow-x-auto px-[clamp(16px,4vw,48px)] [scroll-padding-inline:clamp(16px,4vw,48px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }`}
        >
          {movies.map((m, i) => (
            <li key={m.title} className="floaty flex w-[290px] flex-none snap-start sm:w-[420px] lg:w-[560px]" style={{ animationDelay: `-${(i * 1.3).toFixed(1)}s` }}>
              <AftermovieCard movie={m} onOpen={() => player.open(m)} className="w-full" />
            </li>
          ))}
        </ul>
        {pinned && (
          <div aria-hidden="true" className="mx-[clamp(16px,4vw,128px)] h-0.5 bg-line">
            <div ref={barRef} className="h-full origin-left bg-lotus" style={{ transform: "scaleX(0)" }} />
          </div>
        )}
      </div>
      <VideoPlayer {...player.props} />
    </section>
  );
}

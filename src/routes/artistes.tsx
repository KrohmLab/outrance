import { useRef, useState } from "react";
import { useSearchParams, type ShouldRevalidateFunctionArgs } from "react-router";
import { ArtistCard, DuotoneFilter } from "../components/artistes/ArtistCard";
import { ArtistPanel } from "../components/artistes/ArtistPanel";
import { BookingForm } from "../components/artistes/BookingForm";
import type { FormatFilter, RosterArtist } from "../components/artistes/types";
import { ChipGroup } from "../components/ChipGroup";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { artists, eventsWithArtist, site } from "../content/load.server";
import { fullTitle } from "../lib/calendar";
import { useHydrated } from "../lib/useHydrated";
import { site as clientSite } from "../site";
import type { Route } from "./+types/artistes";
import { pageMeta } from "../lib/seo";

// Artistes (Artistes.dc.html, -tablette, -mobile) : roster, fiche en panneau (?artiste=slug), booking.
export function loader() {
  const roster: RosterArtist[] = artists.map((a) => ({
    ...a,
    events: eventsWithArtist(a.slug).map((e) => ({ slug: e.slug, title: fullTitle(e), date: e.date })),
  }));
  return { roster, intro: site.association.story[2] ?? "" };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({ title: `Artistes — ${clientSite.name}`, description: loaderData?.intro ?? clientSite.metaDescription, path: "/artistes" });

// Le panneau vit dans l’URL : l’ouvrir ou le fermer ne recharge pas les données.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

const FILTERS: { value: FormatFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "DJset", label: "DJ sets" },
  { value: "Live", label: "Lives" },
];

export default function Artistes({ loaderData }: Route.ComponentProps) {
  const { roster, intro } = loaderData;
  const [params, setParams] = useSearchParams();
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<FormatFilter>("all");
  const [bookFor, setBookFor] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);
  // Garde le dernier artiste affiché pendant l’animation de fermeture.
  const [last, setLast] = useState<RosterArtist | null>(null);

  const list = filter === "all" ? roster : roster.filter((a) => a.format === filter);
  const slug = hydrated ? params.get("artiste") : null;
  const current = roster.find((a) => a.slug === slug) ?? null;
  if (current && current !== last) setLast(current);
  const shown = current ?? last;

  const setArtist = (next: string | null) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next) p.set("artiste", next);
        else p.delete("artiste");
        return p;
      },
      { replace: true, preventScrollReset: true },
    );

  // Précédent / suivant : boucle sur la liste filtrée (ou tout le roster si l’artiste n’y est pas).
  const nav = list.some((a) => a.slug === current?.slug) ? list : roster;
  const step = (delta: number) => {
    const i = nav.findIndex((a) => a.slug === current?.slug);
    const next = nav[(i + delta + nav.length) % nav.length];
    if (next) setArtist(next.slug);
  };

  const book = (artist: RosterArtist) => {
    setBookFor(artist.slug);
    setArtist(null);
    // Après la fermeture (focus rendu à la carte), on descend jusqu’au formulaire.
    setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
      selectRef.current?.focus({ preventScroll: true });
    }, 120);
  };

  return (
    <>
      <DuotoneFilter />
      <PageHeader
        label="Le roster Outrance"
        title="Artistes"
        intro={<p className="m-0">{intro}</p>}
      >
        <ChipGroup label="Filtrer par format" options={FILTERS} value={filter} onChange={setFilter} stretch className="flex-wrap" />
      </PageHeader>

      <section aria-label="Roster" className="wrap pb-14 sm:pb-24">
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {list.map((artist, i) => (
            <Reveal as="li" key={artist.slug} delay={(i % 4) * 80} className="flex">
              <ArtistCard artist={artist} onOpen={() => setArtist(artist.slug)} />
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="booking" aria-labelledby="booking-titre" className="scroll-mt-24 border-t border-line bg-nuit-raised">
        <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-10 py-14 sm:gap-14 sm:py-24">
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="lbl text-lotus">Booking</span>
            <h2 id="booking-titre" className="disp text-[28px] leading-[1.02] font-bold sm:text-[clamp(30px,3.6vw,48px)] sm:leading-none">
              Vous souhaitez booker un artiste&#8239;?
            </h2>
            <p className="m-0 text-ink-muted sm:text-[18px]">
              Écrivez-nous avec la date, le lieu et le format envisagés : nous revenons vers vous rapidement.
            </p>
            <p className="lbl m-0 mt-2 text-[11px] text-ink-muted">Booking artistes</p>
            <a
              href={`mailto:${clientSite.emails.booking}`}
              className="inline-flex min-h-11 w-fit items-center font-display text-[18px] font-semibold text-lotus no-underline hover:text-ink sm:text-[20px]"
            >
              {clientSite.emails.booking}
            </a>
          </div>
          <BookingForm artists={roster} selected={bookFor} onSelect={setBookFor} selectRef={selectRef} />
        </div>
      </section>

      <ArtistPanel
        artist={shown}
        open={Boolean(current)}
        onClose={() => setArtist(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onBook={book}
        canNavigate={nav.length > 1}
      />
    </>
  );
}

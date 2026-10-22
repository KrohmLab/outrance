import { useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { formatDate } from "../../lib/dates";
import { useHydrated } from "../../lib/useHydrated";
import { useModal } from "../../lib/useModal";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../icons";
import { genresLabel, LINK_LABELS, ofName, type RosterArtist } from "./types";

// Fiche artiste en dialogue : panneau latéral de 560 px à partir de 640 px (glisse depuis la droite
// en 550 ms, contenu décalé de 150 ms), panneau qui remonte du bas en dessous (82 % de l’écran).
// Rendu hors de #contenu (portail) pour échapper au inert de la page.
type Props = {
  artist: RosterArtist | null;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBook: (artist: RosterArtist) => void;
  /** Plus d’un artiste dans la liste : précédent / suivant ont un sens. */
  canNavigate: boolean;
};

export function ArtistPanel({ artist, open, onClose, onPrev, onNext, onBook, canNavigate }: Props) {
  const hydrated = useHydrated();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useModal({ open, onClose, containers: [panelRef], initialFocus: closeRef });

  if (!hydrated) return null;
  const links = artist ? (Object.keys(LINK_LABELS) as (keyof typeof LINK_LABELS)[]).filter((k) => artist.links[k]) : [];

  return createPortal(
    <div className="artist-overlay fixed inset-0 z-[60]" data-open={open || undefined} inert={!open}>
      <div aria-hidden="true" className="artist-backdrop absolute inset-0 bg-nuit/72 sm:backdrop-blur-[6px]" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fiche-artiste-nom"
        className="artist-panel absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col overflow-y-auto rounded-t-[24px] border-t border-line bg-nuit-raised sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(560px,100%)] sm:rounded-none sm:border-t-0 sm:border-l"
      >
        {artist && (
          <>
            <div className="relative flex flex-none items-center justify-center overflow-hidden bg-[#1d1430] max-sm:h-[150px] sm:h-[320px]">
              <svg aria-hidden="true" viewBox="0 0 560 320" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                <g fill="none" stroke="var(--color-line)">
                  {[80, 150, 220, 290].map((r) => (
                    <circle key={r} cx="280" cy="160" r={r} />
                  ))}
                </g>
                <circle cx="280" cy="160" r="115" fill="none" stroke="var(--color-lotus)" strokeWidth="1.5" />
              </svg>
              <span
                aria-hidden="true"
                className="artist-initial disp relative text-[110px] leading-none font-extrabold text-transparent [-webkit-text-stroke:1.5px_var(--color-lotus)] sm:text-[220px]"
              >
                {artist.name.charAt(0)}
              </span>
              <span className="lbl absolute bottom-4 left-5 hidden text-[10px] text-ink-muted sm:block">[Portrait duotone — 16:9]</span>
              <button ref={closeRef} type="button" className="round-btn round-btn-close absolute top-4 right-4" aria-label="Fermer la fiche" onClick={onClose}>
                <CloseIcon />
              </button>
            </div>

            <div className="artist-content flex flex-col gap-6 px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10">
              <div className="flex flex-col gap-3">
                <span className="lbl text-[11px] text-lotus">
                  {artist.format} <span aria-hidden="true">◉</span> {genresLabel(artist)}
                </span>
                <h2 id="fiche-artiste-nom" className="disp text-[36px] leading-none font-extrabold tracking-[-0.01em] sm:text-[48px]">
                  {artist.name}
                </h2>
              </div>

              <p className="m-0 text-ink-muted sm:text-[17px]">
                {artist.bio ?? "Biographie à venir. [À compléter par l’artiste : parcours, labels, dates marquantes.]"}
              </p>

              {links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {links.map((k) => (
                    <a key={k} className="btn btn-ghost" href={artist.links[k]} target="_blank" rel="noopener">
                      {LINK_LABELS[k]} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              )}

              {artist.events.length > 0 && (
                <div className="flex flex-col">
                  <h3 className="lbl m-0 pb-2 text-[11px] text-ink-muted">Avec Outrance</h3>
                  <ul className="m-0 list-none p-0">
                    {artist.events.map((e) => (
                      <li key={e.slug} className="border-t border-line">
                        <Link
                          to={`/evenements/${e.slug}`}
                          className="group flex min-h-11 items-center justify-between gap-4 py-3 text-ink no-underline hover:text-lotus"
                        >
                          <span className="flex flex-col gap-1 transition-transform duration-300 group-hover:translate-x-2">
                            <span className="lbl text-[11px] text-lotus">{formatDate(e.date)}</span>
                            <span className="font-semibold">{e.title}</span>
                          </span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <button type="button" className="btn btn-lotus min-h-[52px]" onClick={() => onBook(artist)}>
                  Booker {artist.name}
                </button>
                {canNavigate && (
                  <div className="flex gap-2">
                    <button type="button" className="round-btn" aria-label="Artiste précédent" onClick={onPrev}>
                      <ChevronLeftIcon />
                    </button>
                    <button type="button" className="round-btn" aria-label="Artiste suivant" onClick={onNext}>
                      <ChevronRightIcon />
                    </button>
                  </div>
                )}
              </div>
              <span className="sr-only" aria-live="polite">
                Fiche {ofName(artist.name)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

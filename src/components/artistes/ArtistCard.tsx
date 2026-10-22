import type { Ref } from "react";
import { ofName, type RosterArtist } from "./types";

// Carte portrait du roster (Artistes.dc.html, Composants « Carte artiste — repos et survol ») :
// fond #1d1430, cercles, anneau lotus qui se trace au survol, initiale en contour, « + » qui pivote.
// Les effets de survol de Tailwind v4 sont réservés aux appareils à pointeur (@media (hover: hover)) ;
// le focus clavier déclenche le même état.
type Props = {
  artist: RosterArtist;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/** Filtre duotone (ombres nuit, hautes lumières lotus) pour les futures photos d’artistes. */
export function DuotoneFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="duotone-nuit" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.039 0.725" />
          <feFuncG type="table" tableValues="0.027 0.545" />
          <feFuncB type="table" tableValues="0.071 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

const lift = "focus-visible:bg-lotus-deep focus-visible:[transform:translateY(-4px)]";
const zoomFocus = "group-focus-visible:[transform:scale(1.04)]";
const traced = "group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]";
const initialOn =
  "group-hover:scale-[1.06] group-hover:text-lotus group-hover:[-webkit-text-stroke-color:var(--color-lotus)] group-focus-visible:scale-[1.06] group-focus-visible:text-lotus group-focus-visible:[-webkit-text-stroke-color:var(--color-lotus)]";
const plusOn =
  "group-hover:rotate-90 group-hover:border-lotus group-hover:bg-lotus group-hover:text-nuit group-focus-visible:rotate-90 group-focus-visible:border-lotus group-focus-visible:bg-lotus group-focus-visible:text-nuit";

export function ArtistCard({ artist, onOpen, ref }: Props) {
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
      className={`card group w-full cursor-pointer ${lift}`}
    >
      <span aria-hidden="true" className={`zoom relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-[#1d1430] ${zoomFocus}`}>
        {artist.photo ? (
          <>
            <img src={artist.photo} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <img
              src={artist.photo}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-opacity duration-500 [filter:url(#duotone-nuit)] group-hover:opacity-0 group-focus-visible:opacity-0"
            />
          </>
        ) : (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 400 500"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 hidden size-full sm:block"
            >
              <circle
                cx="200"
                cy="230"
                r="150"
                fill="none"
                stroke="var(--color-lotus)"
                strokeWidth="1.5"
                strokeDasharray="943"
                strokeDashoffset="943"
                transform="rotate(-90 200 230)"
                className={`transition-[stroke-dashoffset] duration-[1.1s] ease-nuit ${traced}`}
              />
              <g fill="none" stroke="var(--color-line)">
                <circle cx="200" cy="230" r="90" />
                <circle cx="200" cy="230" r="210" />
                <circle cx="200" cy="230" r="270" />
              </g>
            </svg>
            <span
              aria-hidden="true"
              className={`disp relative text-[92px] leading-none font-extrabold text-transparent [-webkit-text-stroke:1.5px_var(--color-border)] [transition:color_.5s,-webkit-text-stroke-color_.5s,scale_.7s_var(--ease-nuit)] sm:text-[124px] lg:text-[150px] ${initialOn}`}
            >
              {artist.name.charAt(0)}
            </span>
            <span className="lbl absolute bottom-3.5 left-3.5 hidden text-[10px] text-ink-muted sm:block">[Portrait duotone]</span>
          </>
        )}
        <span className="lbl absolute top-2.5 left-2.5 rounded-sm bg-nuit px-2 py-1 text-[10px] text-ink sm:top-3.5 sm:left-3.5 sm:px-[9px] sm:py-[5px]">
          {artist.format}
        </span>
      </span>

      <span className="flex w-full items-end justify-between gap-3 px-3.5 pt-3 pb-3.5 sm:px-[18px] sm:pt-4 sm:pb-[18px] lg:px-[22px] lg:pt-5 lg:pb-[22px]">
        <span className="flex min-w-0 flex-col gap-1 sm:gap-2">
          <span className="disp text-[15px] leading-[1.15] font-semibold break-words sm:text-[18px] lg:text-[22px]">
            <span className="sr-only">Voir la fiche {ofName(artist.name)} ({artist.format}) : </span>
            {artist.name}
          </span>
          <span className="lbl text-[10px] text-lotus lg:text-[11px]">
            {/* Coupure possible après chaque « / » pour les listes de genres longues. */}
            {artist.genres.map((g, i) => (
              <span key={g}>
                {i > 0 && (
                  <>
                    /<wbr />
                  </>
                )}
                {g}
              </span>
            ))}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`hidden size-10 flex-none items-center justify-center rounded-pill border-[1.5px] border-border font-display text-[18px] text-ink [transition:rotate_.4s,background_.3s,border-color_.3s,color_.3s] sm:flex ${plusOn}`}
        >
          +
        </span>
      </span>
    </button>
  );
}

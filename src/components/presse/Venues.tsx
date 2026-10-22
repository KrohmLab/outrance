import { useState } from "react";
import { PlayIcon } from "../icons";

// « Ils nous ont accueillis » : bandeau défilant (CSS, transform seul). Liste doublée pour boucler à -50 %,
// le doublon en aria-hidden. Pause au survol, au focus (bouton) et par le bouton pause/lecture (WCAG 2.2.2).
// Mouvement réduit : liste statique qui passe à la ligne, sans doublon ni bouton.
const KEYFRAMES = "@keyframes presse-marquee{to{transform:translateX(-50%)}}";

function PauseIcon() {
  return (
    <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6.5" y="5.5" width="3.75" height="13" rx="1" />
      <rect x="13.75" y="5.5" width="3.75" height="13" rx="1" />
    </svg>
  );
}

function VenueList({ venues, copy }: { venues: string[]; copy?: boolean }) {
  return (
    <ul
      role="list"
      aria-label={copy ? undefined : "Lieux partenaires"}
      aria-hidden={copy || undefined}
      className={`m-0 flex list-none p-0 motion-reduce:flex-wrap motion-reduce:gap-y-3 ${copy ? "motion-reduce:hidden" : ""}`}
    >
      {venues.map((name, i) => (
        <li
          key={name}
          className={`disp flex items-center gap-10 pr-10 text-[40px] leading-[1.2] font-extrabold whitespace-nowrap motion-reduce:gap-5 motion-reduce:pr-5 motion-reduce:text-[clamp(24px,6vw,40px)] motion-reduce:whitespace-normal ${
            i % 2 ? "text-transparent [-webkit-text-stroke:1.2px_var(--color-ink)]" : "text-ink"
          }`}
        >
          {name}
          <span aria-hidden="true" className="text-[16px] text-lotus [-webkit-text-stroke:0]">
            ◉
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Venues({ venues }: { venues: string[] }) {
  const [paused, setPaused] = useState(false);

  return (
    <section aria-labelledby="lieux-titre" className="group/venues overflow-hidden border-t border-line py-16 sm:py-[72px]">
      <style>{KEYFRAMES}</style>
      <div className="wrap flex items-center justify-between gap-4 pb-8">
        <h2 id="lieux-titre" className="lbl m-0 text-lotus">
          Ils nous ont accueillis
        </h2>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Reprendre le défilement" : "Mettre en pause le défilement"}
          className="round-btn motion-reduce:hidden"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>
      <div className="group/band">
        <div
          data-paused={paused || undefined}
          className="flex w-max animate-[presse-marquee_48s_linear_infinite] will-change-transform group-focus-within/venues:[animation-play-state:paused] group-hover/band:[animation-play-state:paused] data-paused:[animation-play-state:paused] motion-reduce:wrap motion-reduce:animate-none motion-reduce:will-change-auto"
        >
          <VenueList venues={venues} />
          <VenueList venues={venues} copy />
        </div>
      </div>
    </section>
  );
}

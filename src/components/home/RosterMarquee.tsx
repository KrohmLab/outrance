import { useRef } from "react";
import type { MotionLevel } from "../../lib/useMotionLevel";
import { usePageScroll } from "./usePageScroll";

// Bandeau d’artistes : avance avec le scroll en desktop (0,4 px par pixel) et dérive lentement ;
// un nom sur deux en contour lotus. La dérive s’arrête au survol et au focus (brand book).
// En mobile, il remonte sous l’événement du hero pendant la fin de l’envol (-26svh) : sinon la moitié
// basse de l’écran reste vide jusqu’à la fin de la section.
export function RosterMarquee({ names, level }: { names: string[]; level: MotionLevel }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  usePageScroll(
    ref,
    (st) => {
      if (trackRef.current) trackRef.current.style.transform = `translateX(${(-st * 0.4).toFixed(1)}px)`;
    },
    level === "full",
  );
  const loop = [...names, ...names, ...names, ...names];

  return (
    <section ref={ref} aria-label="Artistes du roster" className="marquee-band relative z-10 -mt-[26svh] flex h-20 items-center overflow-hidden border-y border-line sm:mt-0 sm:h-[120px]">
      <ul className="sr-only">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div ref={trackRef} aria-hidden="true" className="flex items-center">
        <div className="drift-x flex items-center">
          {loop.map((n, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`disp text-[32px] leading-none font-extrabold whitespace-nowrap sm:text-[56px] ${i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_var(--color-lotus)]" : "text-ink"}`}
              >
                {n}
              </span>
              <span className="px-6 text-[16px] text-lotus sm:px-9 sm:text-[20px]">◉</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

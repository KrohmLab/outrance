import { useRef } from "react";
import type { MotionLevel } from "../../lib/useMotionLevel";
import { site } from "../../site";
import { clamp01, lerp } from "./motion-math";
import { usePageScroll } from "./usePageScroll";

// Bandeau Belgium : un grand « Belgium » en contour traverse la section avec le scroll (desktop) et dérive.
export function BelgiumBand({ level }: { level: MotionLevel }) {
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  usePageScroll(
    ref,
    (st, top, vh) => {
      const pb = clamp01((st - top + vh) / (vh + (ref.current?.offsetHeight ?? 420)));
      if (wordRef.current) wordRef.current.style.transform = `translate(${lerp(200, -1400, pb).toFixed(1)}px, -50%)`;
    },
    level === "full",
  );
  return (
    <section ref={ref} aria-labelledby="home-belgium" className="relative overflow-hidden border-y border-line">
      <span
        ref={wordRef}
        aria-hidden="true"
        className="disp pointer-events-none absolute top-1/2 left-0 text-[140px] leading-none font-extrabold whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_var(--color-line)] sm:text-[260px]"
        style={{ transform: "translate(0, -50%)" }}
      >
        <span className="drift-b">Belgium · Belgium · Belgium · Belgium · </span>
      </span>
      <div className="wrap relative flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center sm:py-24 lg:min-h-[420px]">
        <div className="flex max-w-[640px] flex-col gap-3">
          <span className="lbl text-lotus">Depuis {site.association.belgiumSince}</span>
          <h2 id="home-belgium" className="disp text-[36px] leading-none font-bold sm:text-display-l">
            Outrance Belgium
          </h2>
          <p className="m-0 text-ink-muted sm:text-[18px]">Du Kultura à Liège au FFORMATT à Bruxelles : Outrance fait aussi vibrer la Belgique.</p>
        </div>
        <a className="btn btn-ghost border-lotus!" href={site.belgiumUrl}>
          outrance.be <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

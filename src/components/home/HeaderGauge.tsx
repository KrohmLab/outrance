import { useMotionValueEvent, useScroll } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { BLOOM_PATHS } from "../lotus-paths";

// Jauge de lecture du header de l’accueil : le lotus du hero s’y pose en fin d’envol.
// Anneau lotus qui se remplit avec la progression de la page, marque qui tourne avec le scroll,
// fond du header qui apparaît sur les 240 premiers pixels. Écritures directes dans le DOM.
const RING = 1835;

export function HeaderGauge({ headerRef }: { headerRef: React.RefObject<HTMLElement | null> }) {
  const ringRef = useRef<SVGCircleElement>(null);
  const rotRef = useRef<SVGGElement>(null);
  const { scrollY, scrollYProgress } = useScroll();

  const update = () => {
    const y = scrollY.get();
    const p = scrollYProgress.get();
    ringRef.current?.setAttribute("stroke-dashoffset", (RING * (1 - p)).toFixed(1));
    if (rotRef.current) rotRef.current.style.transform = `rotate(${(y * 0.12).toFixed(1)}deg)`;
    const header = headerRef.current;
    if (header) {
      header.style.setProperty("--hb", Math.min(1, y / 240).toFixed(3));
      if (y > 8) header.dataset.scrolled = "";
      else delete header.dataset.scrolled;
    }
  };
  useMotionValueEvent(scrollY, "change", update);
  useLayoutEffect(update);

  return (
    <svg
      data-gauge
      aria-hidden="true"
      viewBox="-300 -300 600 600"
      className="header-gauge pointer-events-none absolute top-1/2 left-0 size-8 -translate-y-1/2 sm:size-10"
    >
      <circle r="292" fill="none" stroke="var(--color-line)" strokeWidth="16" />
      <circle
        ref={ringRef}
        r="292"
        fill="none"
        stroke="var(--color-lotus)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={RING}
        strokeDashoffset={RING}
        transform="rotate(-90)"
      />
      <g ref={rotRef} style={{ transformOrigin: "0 0", transition: "transform .25s ease-out" }}>
        <g className="gauge-spin">
          <path d={BLOOM_PATHS[0]} fill="none" stroke="var(--color-lotus)" strokeWidth="14" />
          <path d={BLOOM_PATHS[2]} fill="var(--color-lotus)" />
        </g>
      </g>
    </svg>
  );
}

import { useEffect, useRef } from "react";

// Mandala du hero de la fiche (Evenement.dc.html et Evenement-tablette.dc.html) : géométrie propre
// à la fiche, différente du Mandala partagé. Desktop : 5 cercles, 12 ellipses, 120 s ;
// tablette : 4 cercles, 8 ellipses, 90 s ; mobile : la géométrie tablette, plus petite et plus discrète. Rotation suspendue hors écran,
// neutralisée en mouvement réduit par theme.css.

const DESKTOP = { radii: [60, 120, 180, 240, 290], petals: 12 };
const TABLET = { radii: [60, 140, 220, 290], petals: 8 };

function Rings({ radii, petals }: { radii: number[]; petals: number }) {
  const step = 360 / petals;
  return (
    <g fill="none" stroke="var(--color-lotus)" strokeWidth={0.8}>
      {radii.map((r) => (
        <circle key={r} r={r} />
      ))}
      {Array.from({ length: petals }, (_, i) => (
        <ellipse key={i} cx="0" cy="-160" rx="36" ry="100" transform={i ? `rotate(${i * step})` : undefined} />
      ))}
    </g>
  );
}

export function HeroMandala() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const svgs = el.querySelectorAll<SVGSVGElement>("svg");
    const io = new IntersectionObserver(([entry]) => {
      svgs.forEach((s) => (s.style.animationPlayState = entry?.isIntersecting ? "running" : "paused"));
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <svg
        viewBox="-300 -300 600 600"
        className="absolute -top-[160px] -right-[240px] block size-[520px] animate-[spin_90s_linear_infinite] opacity-20 sm:-top-[260px] sm:-right-[380px] sm:size-[900px] sm:opacity-25 lg:hidden"
      >
        <Rings {...TABLET} />
      </svg>
      <svg
        viewBox="-300 -300 600 600"
        className="absolute -top-[420px] left-1/2 -ml-[600px] hidden size-[1200px] animate-[spin_120s_linear_infinite] opacity-[0.22] lg:block"
      >
        <Rings {...DESKTOP} />
      </svg>
    </div>
  );
}

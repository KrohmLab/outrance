import { useEffect, useRef, type ReactNode } from "react";

// Rail horizontal d’artistes (roster, mobile) rendu évident à faire défiler :
// - le séparateur sous le rail devient une barre de progression (curseur lotus = part visible du rail) ;
// - un fondu sur le bord droit tant qu’il reste des artistes à voir ;
// - une petite invitation au glissement, une seule fois, quand la section arrive à l’écran.
// Mises à jour par image dans le DOM (pas de setState).
export function RosterRail({ label, children }: { label: string; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    const fade = fadeRef.current;
    if (!rail || !thumb || !fade) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { scrollLeft, scrollWidth, clientWidth } = rail;
      const visible = Math.min(1, clientWidth / Math.max(1, scrollWidth));
      const max = Math.max(1, scrollWidth - clientWidth);
      const p = Math.min(1, Math.max(0, scrollLeft / max));
      thumb.style.width = `${(visible * 100).toFixed(2)}%`;
      thumb.style.transform = `translateX(${((p * (1 - visible)) / visible) * 100}%)`;
      fade.style.opacity = p > 0.98 || visible >= 1 ? "0" : "1";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Invitation au glissement : une fois, à l’arrivée à l’écran, sauf en mouvement réduit.
    let io: IntersectionObserver | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          io?.disconnect();
          if (rail.scrollLeft > 0) return;
          rail.animate([{ transform: "none" }, { transform: "translateX(-36px)", offset: 0.45 }, { transform: "none" }], {
            duration: 1100,
            delay: 400,
            easing: "cubic-bezier(.2,.7,.2,1)",
          });
        },
        { threshold: 0.8 },
      );
      io.observe(rail);
    }

    return () => {
      cancelAnimationFrame(raf);
      rail.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      io?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative -mx-4">
        <div
          ref={railRef}
          role="group"
          aria-label={label}
          className="flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        <div
          ref={fadeRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-nuit to-transparent transition-opacity duration-300"
        />
      </div>
      {/* Séparateur = barre de progression du rail. */}
      <div aria-hidden="true" className="relative h-0.5 overflow-hidden rounded-pill bg-line">
        <div ref={thumbRef} className="absolute inset-y-0 left-0 rounded-pill bg-lotus" style={{ width: "50%" }} />
      </div>
    </div>
  );
}

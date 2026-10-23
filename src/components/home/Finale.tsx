import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion, type MotionLevel } from "../../lib/useMotionLevel";
import { logoSrcSet, logoUrl } from "../../site";
import { Newsletter } from "../Newsletter";
import { Lotus } from "./Lotus";
import { clamp01, easeInOut } from "./motion-math";
import { usePageScroll } from "./usePageScroll";

// Finale : un grand lotus se rouvre derrière le logo, « À très vite sur le dancefloor », newsletter.
// Desktop : lié au scroll. Tablette et mobile : s’ouvre une fois à l’arrivée (transition de --b).
export function Finale({ level }: { level: MotionLevel }) {
  const ref = useRef<HTMLElement>(null);
  const lotusRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const linked = level === "full";
  const reduced = useReducedMotion();

  usePageScroll(
    ref,
    (st, top, vh) => {
      const k = vh / 900;
      const pf = clamp01((st - (top - 700 * k)) / (700 * k));
      const lotus = lotusRef.current;
      if (lotus) {
        lotus.style.setProperty("--b", easeInOut(pf).toFixed(4));
        lotus.style.opacity = clamp01(pf * 1.5).toFixed(3);
        lotus.style.transform = `translate(-50%, -50%) rotate(${(pf * 50).toFixed(1)}deg)`;
      }
      const t = clamp01((pf - 0.35) / 0.5);
      if (textRef.current) {
        textRef.current.style.opacity = t.toFixed(3);
        textRef.current.style.transform = `translateY(${((1 - t) * 30).toFixed(1)}px)`;
      }
    },
    linked,
  );

  // Hors desktop : ouverture une seule fois quand la section arrive à l’écran.
  useEffect(() => {
    const el = ref.current;
    const lotus = lotusRef.current;
    if (linked || !el || !lotus) return;
    if (reduced) {
      lotus.style.setProperty("--b", "1");
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        lotus.dataset.open = "";
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [linked, reduced]);

  return (
    <section ref={ref} aria-labelledby="home-finale" className="relative flex flex-col items-center justify-center overflow-hidden py-16 sm:min-h-[640px] sm:py-24 lg:min-h-[100vh]">
      <div
        ref={lotusRef}
        aria-hidden="true"
        className={`finale-lotus pointer-events-none absolute top-1/2 left-1/2 size-[420px] sm:size-[640px] lg:size-[860px] ${linked ? "" : "finale-static"}`}
        style={{ "--b": 0, transform: "translate(-50%, -50%)" } as CSSProperties}
      >
        <div
          className="par size-full"
          style={{
            transform:
              "perspective(1400px) translate(calc(var(--mx, 0) * -46px), calc(var(--my, 0) * -34px)) rotateY(calc(var(--mx, 0) * 14deg)) rotateX(calc(var(--my, 0) * -10deg))",
          }}
        >
          <div className="lev-x d size-full">
            <div className="lev-y d size-full">
              <div className="lev-tilt d size-full">
                <div className="breathe size-full">
                  <Lotus />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={textRef} className="relative flex w-full flex-col items-center gap-6 px-4 text-center">
        <img src={logoUrl} srcSet={logoSrcSet} sizes="(min-width: 1024px) 560px, (min-width: 640px) 440px, 300px" alt="Outrance" width={1600} height={233} loading="lazy" className="block h-auto w-[min(300px,78vw)] sm:w-[440px] lg:w-[560px]" />
        <p id="home-finale" className="disp m-0 text-[18px] font-semibold tracking-[0.04em] sm:text-[22px]">
          À très vite sur le dancefloor
        </p>
        <Newsletter id="newsletter" className="w-full max-w-[640px] bg-nuit-raised/90 text-left" />
      </div>
    </section>
  );
}

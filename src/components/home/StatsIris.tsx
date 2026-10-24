import { useRef } from "react";
import { Link } from "react-router";
import type { MotionLevel } from "../../lib/useMotionLevel";
import { Mandala } from "../Mandala";
import { Reveal } from "../Reveal";
import { clamp01, easeInOut, easeOut, lerp } from "./motion-math";
import { usePageScroll } from "./usePageScroll";

// Chiffres clés en iris (Main.dc.html) : un cercle lotus-deep s’ouvre depuis le centre pendant l’entrée
// (pc), les compteurs montent de 0 à leur valeur, puis l’iris se referme et les chiffres s’envolent
// à la sortie (po). Desktop et tablette : lié au scroll ; mobile : révélé une fois, sans compteurs.
type Stat = { value: number; label: string };

const fr = new Intl.NumberFormat("fr-FR");

export function StatsIris({ stats, founded, level }: { stats: Stat[]; founded: string; level: MotionLevel }) {
  const ref = useRef<HTMLElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const mandalaRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const linked = level === "full" || level === "tablet";
  const mid = (stats.length - 1) / 2;

  usePageScroll(
    ref,
    (st, top, vh) => {
      // Mêmes seuils que le prototype (fenêtre de 900 px), proportionnés à la hauteur réelle.
      const k = vh / 900;
      const pc = clamp01((st - (top - 650 * k)) / (650 * k));
      const po = easeInOut(clamp01((st - (top + 160 * k)) / (640 * k)));
      const iris = irisRef.current;
      if (iris) iris.style.clipPath = `circle(${(easeOut(pc) * 82 * (1 - po)).toFixed(2)}% at 50% ${lerp(50, 62, po).toFixed(1)}%)`;
      if (mandalaRef.current) {
        mandalaRef.current.style.opacity = (pc * 0.22 * (1 - po)).toFixed(3);
        mandalaRef.current.style.transform = `translate(-50%, -50%) rotate(${(st * 0.04 + po * 140).toFixed(1)}deg) scale(${lerp(1, 0.35, po).toFixed(3)})`;
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = (pc * (1 - po)).toFixed(2);
        ringRef.current.style.transform = `translate(-50%, -50%) rotate(${(po * -120).toFixed(1)}deg) scale(${lerp(1, 0.2, po).toFixed(3)})`;
      }
      const content = contentRef.current;
      if (content) {
        content.style.opacity = (clamp01(pc * 1.6) * (1 - clamp01((po - 0.3) / 0.45))).toFixed(3);
        content.style.transform = `translateY(${(po * -40).toFixed(1)}px) scale(${(lerp(0.94, 1, easeOut(pc)) * lerp(1, 0.88, po)).toFixed(3)})`;
      }
      stats.forEach((s, i) => {
        const out = easeInOut(clamp01(po * 1.5 - Math.abs(i - mid) * 0.12));
        const box = boxRefs.current[i];
        if (box) {
          box.style.opacity = (1 - out).toFixed(3);
          box.style.transform = `translate(${((i - mid) * out * -38).toFixed(1)}px, ${(out * -70).toFixed(1)}px) scale(${lerp(1, 0.7, out).toFixed(3)})`;
        }
        const val = valueRefs.current[i];
        if (val) val.textContent = fr.format(Math.round(s.value * easeOut(clamp01(pc * 1.25 - i * 0.05))));
      });
    },
    linked,
  );

  return (
    <section ref={ref} aria-labelledby="home-stats" className="relative overflow-hidden lg:h-[100vh] lg:min-h-[760px]">
      <div
        ref={irisRef}
        aria-hidden="true"
        className="absolute inset-0 bg-lotus-deep"
        style={{ clipPath: linked ? "circle(0% at 50% 50%)" : undefined }}
      />
      {level !== "mobile" && (
        <>
          <div ref={mandalaRef} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 size-[1100px] opacity-[.22]" style={{ transform: "translate(-50%, -50%)" }}>
            <Mandala spin={false} />
          </div>
          <div ref={ringRef} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <svg viewBox="-300 -300 600 600" className="block size-[640px] lg:size-[980px]">
              <circle className="slowspin-rev" r="290" fill="none" stroke="var(--color-lotus)" strokeOpacity=".35" strokeWidth=".8" strokeDasharray="1 9" />
              <circle className="orbiter" r="4" cx="0" cy="-290" fill="var(--color-lotus)" />
            </svg>
          </div>
        </>
      )}
      <Reveal className="relative">
        <div ref={contentRef} className="wrap flex h-full flex-col items-center justify-center gap-4 py-16 text-center sm:py-24 lg:min-h-[100vh] lg:py-0">
          <span className="lbl text-lotus">L’association — depuis {founded.slice(0, 4)}</span>
          <h2 id="home-stats" className="disp text-[30px] leading-none font-bold sm:text-[48px] lg:text-[64px]">
            Répandre la psytrance
            <br />
            et son univers
          </h2>
          <div className="grid w-full max-w-[1180px] grid-cols-2 gap-8 pt-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-10 lg:pt-12">
            {stats.map((s, i) => (
              <div
                key={s.label}
                ref={(el) => {
                  boxRefs.current[i] = el;
                }}
                className="flex flex-col items-center gap-2 max-sm:odd:last:col-span-2"
              >
                <span
                  ref={(el) => {
                    valueRefs.current[i] = el;
                  }}
                  className={`disp text-[56px] leading-none font-extrabold sm:text-[72px] lg:text-[96px] ${i > 2 ? "text-lotus" : "text-ink"}`}
                >
                  {fr.format(s.value)}
                </span>
                <span className="lbl text-center text-ink-muted">{s.label}</span>
              </div>
            ))}
          </div>
          <Link className="lnk mt-6" to="/association" prefetch="intent">
            Notre histoire <span className="ar" aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

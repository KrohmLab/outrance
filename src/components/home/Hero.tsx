import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router";
import type { LineupItem, OutranceEvent } from "../../content/schemas";
import { formatDate } from "../../lib/dates";
import { useReducedMotion, type MotionLevel } from "../../lib/useMotionLevel";
import { logoUrl, site } from "../../site";
import { Lotus } from "./Lotus";
import { Motes, MOTE_COUNT } from "./Motes";
import { heroPhases, lerp } from "./motion-math";

// Hero « Floraison » (Main.dc.html, Accueil-tablette, Accueil-mobile) :
// 1. bouton (0 → 4 %) ; 2. éclosion (4 → 50 %) ; 3. révélation de l’événement (36 → 58 %) ;
// 4. envol (72 → 100 %) : le lotus rétrécit et se pose dans la jauge du header, le logo glisse.
// Chaque image, une seule fonction écrit transform/opacity et des variables CSS sur les éléments
// concernés : aucun setState pendant le scroll.

export type HeroEvent = Pick<
  OutranceEvent,
  "slug" | "title" | "titlePrefix" | "date" | "venue" | "city" | "ticketUrl" | "ticketStatus"
> & { lineup: LineupItem[] };

type Props = {
  event: HeroEvent | null;
  upcoming: boolean;
  level: MotionLevel;
  /** Premier chargement de la page : voile nuit sous le lotus, qui se dessine puis s’ouvre en iris. */
  intro?: boolean;
};

function splitTitle(e: HeroEvent): [string | null, string] {
  if (e.titlePrefix) return [e.titlePrefix, e.title];
  const m = /^(Outrance)\s+(.+)$/.exec(e.title);
  return m ? [m[1] ?? null, m[2] ?? e.title] : [null, e.title];
}

export function Hero({ event, upcoming, level, intro = false }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const lotusRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef<HTMLDivElement>(null);
  const flyTarget = useRef({ dx: 0, dy: 0, scale: 0.053 });
  // Vraie préférence du navigateur (et non le niveau provisoire du pré-rendu) : évite un flash de la fleur ouverte.
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Position de la jauge du header par rapport au centre de l’écran (cible de l’envol).
  const measure = useCallback(() => {
    const gauge = document.querySelector<SVGElement>("[data-gauge]");
    const lotus = lotusRef.current;
    if (!gauge || !lotus) return;
    const g = gauge.getBoundingClientRect();
    const size = lotus.offsetWidth || 1;
    flyTarget.current = {
      dx: g.left + g.width / 2 - window.innerWidth / 2,
      dy: g.top + g.height / 2 - window.innerHeight / 2,
      scale: g.width / size,
    };
  }, []);

  const apply = useCallback(
    (h: number) => {
      const p = reduced ? { bloom: 1, ev: 1, fly: 0, intro: 0, rot: 0 } : heroPhases(h);
      const { dx, dy, scale } = flyTarget.current;
      const lotus = lotusRef.current;
      if (lotus) {
        const sc = lerp(1, scale, p.fly);
        const fade = 1 - Math.max(0, Math.min(1, (p.fly - 0.86) / 0.14));
        lotus.style.transform = `translate(calc(-50% + ${(dx * p.fly).toFixed(1)}px), calc(-50% + ${(dy * p.fly).toFixed(1)}px)) scale(${sc.toFixed(3)}) rotate(${p.rot.toFixed(1)}deg)`;
        lotus.style.opacity = (fade * (1 - p.ev * 0.35 * (1 - p.fly))).toFixed(3);
        lotus.style.setProperty("--b", p.bloom.toFixed(4));
        lotus.style.setProperty("--damp", (1 - p.ev * 0.75).toFixed(3));
        lotus.style.setProperty("--lev", (1 - p.ev * 0.7).toFixed(3));
      }
      const halo = haloRef.current;
      if (halo) {
        halo.style.transform = `translate(-50%, -50%) scale(${lerp(0.5, 1.5, reduced ? 1 : h).toFixed(3)}) rotate(${(reduced ? 0 : h * -40).toFixed(1)}deg)`;
        halo.style.opacity = (1 - p.fly).toFixed(2);
        halo.style.setProperty("--damp", (1 - p.ev * 0.75).toFixed(3));
      }
      if (glowRef.current) glowRef.current.style.opacity = (reduced ? 0 : 1 - p.fly).toFixed(2);
      const intro = introRef.current;
      if (intro) {
        intro.style.opacity = p.intro.toFixed(3);
        intro.style.transform = `translateY(${(-(1 - p.intro) * 60).toFixed(1)}px)`;
        intro.style.visibility = p.intro > 0.01 ? "visible" : "hidden";
      }
      const ev = eventRef.current;
      if (ev) {
        ev.style.opacity = p.ev.toFixed(3);
        ev.style.transform = `translate(-50%, calc(-50% + ${((1 - p.ev) * 48).toFixed(1)}px))`;
        ev.style.visibility = p.ev > 0.01 ? "visible" : "hidden";
      }
      // Header : la jauge apparaît en fin d’envol, le logo glisse pour lui laisser la place.
      const header = document.querySelector<HTMLElement>("[data-home-header]");
      if (header) {
        const mark = reduced ? 1 : Math.max(0, Math.min(1, (p.fly - 0.9) / 0.1));
        const slide = reduced ? 1 : 1 - Math.pow(1 - Math.max(0, Math.min(1, (p.fly - 0.5) / 0.4)), 3);
        header.style.setProperty("--mark", mark.toFixed(3));
        header.style.setProperty("--slide", slide.toFixed(3));
      }
    },
    [reduced],
  );

  useMotionValueEvent(scrollYProgress, "change", apply);

  useLayoutEffect(() => {
    measure();
    apply(scrollYProgress.get());
    const onResize = () => {
      measure();
      apply(scrollYProgress.get());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [apply, measure, scrollYProgress]);

  // En quittant l’accueil, la jauge reste visible et le logo à sa place normale.
  useEffect(
    () => () => {
      const header = document.querySelector<HTMLElement>("[data-home-header]");
      header?.style.removeProperty("--mark");
      header?.style.removeProperty("--slide");
    },
    [],
  );

  const [prefix, title] = event ? splitTitle(event) : [null, ""];
  const place = event ? [event.venue, event.city].filter(Boolean).join(", ") : "";
  const b2b = event?.lineup.filter((l) => l.format === "B2B") ?? [];
  const others = event?.lineup.filter((l) => l.format !== "B2B") ?? [];
  const canBuy = upcoming && event?.ticketStatus !== "soldOut";

  return (
    <section ref={sectionRef} aria-label="Accueil" className="relative h-[195svh] lg:h-[267vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {level === "full" && (
          <div aria-hidden="true" ref={glowRef} className="pointer-events-none absolute inset-0">
            <div className="cglow" />
          </div>
        )}
        <Motes count={MOTE_COUNT[level]} />

        {/* Halo, ondes et cercles concentriques. */}
        {/* Au-dessus du voile de chargement : ses cercles naissent du bouton au premier battement. */}
        <div aria-hidden="true" ref={haloRef} className="pointer-events-none absolute top-1/2 left-1/2 z-[15]" style={{ transform: "translate(-50%, -50%) scale(.5)" }}>
          <div className="par" style={{ transform: "translate(calc(var(--mx, 0) * -62px * var(--damp, 1)), calc(var(--my, 0) * -47px * var(--damp, 1)))" }}>
            <svg viewBox="-300 -300 600 600" className="block size-[700px] overflow-visible sm:size-[1100px] lg:size-[1400px]">
              <circle className="wave" r="200" fill="none" stroke="var(--color-lotus)" strokeWidth="1" />
              <circle className="wave w2" r="200" fill="none" stroke="var(--color-lotus)" strokeWidth="1" />
              <g fill="none" stroke="var(--color-lotus)">
                {[
                  [120, 0.18],
                  [180, 0.14],
                  [240, 0.1],
                  [296, 0.07],
                ].map(([r, o], i) => (
                  <circle key={r} className="halo-ring" r={r} strokeOpacity={o} style={{ "--i": i } as CSSProperties} />
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Écran de chargement : voile nuit qui se referme en iris sous le lotus du hero (le même lotus). */}
        {intro && <div aria-hidden="true" className="home-intro-veil pointer-events-none absolute inset-0 z-10 bg-nuit" />}

        {/* Le lotus : bouton → fleur → jauge du header. */}
        <div
          ref={lotusRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 size-[340px] sm:size-[600px] lg:size-[760px]"
          style={{ transform: "translate(-50%, -50%)", "--b": 0 } as CSSProperties}
        >
          <div
            className="par size-full"
            style={{
              transform:
                "perspective(1400px) translate(calc(var(--mx, 0) * -56px * var(--damp, 1)), calc(var(--my, 0) * -42px * var(--damp, 1))) rotateY(calc(var(--mx, 0) * 12deg * var(--damp, 1))) rotateX(calc(var(--my, 0) * -9deg * var(--damp, 1)))",
            }}
          >
            <div className="lev-x size-full">
              <div className="lev-y size-full">
                <div className="lev-tilt size-full">
                  <div className="breathe relative size-full">
                    <div className="slowspin size-full">
                      <Lotus />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Textes au-dessus du lotus (et du voile de chargement, sous lequel ils apparaissent en fondu). */}
        <div className="hero-text pointer-events-none absolute inset-0 z-30">
          {/* Intro : logo, signature, invitation à scroller. */}
          <div ref={introRef} className="absolute inset-x-0 bottom-[12svh] flex flex-col items-center gap-4 px-4 text-center sm:bottom-[14vh] sm:gap-[18px]">
            <h1 className="m-0">
              <img src={logoUrl} alt="Outrance" width={1600} height={233} className="block h-auto w-[min(300px,78vw)] sm:w-[440px] lg:w-[560px]" />
            </h1>
            <span className="lbl text-[11px] tracking-[0.32em] text-ink-muted sm:text-[13px]">
              {site.tagline} — Lyon &amp; Belgium since {site.association.founded.slice(0, 4)}
            </span>
            <span className="lbl nudge mt-6 flex flex-col items-center gap-1.5 text-[11px] text-lotus sm:mt-14">
              Scrolle pour faire éclore
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
          </div>

          {/* Le prochain événement, sinon le dernier, au cœur du lotus ouvert. */}
          {event && (
            <div
              ref={eventRef}
              className="hero-event pointer-events-auto absolute top-1/2 left-1/2 flex w-[min(1000px,calc(100vw-32px))] flex-col items-center gap-4 text-center sm:gap-5"
              style={{ transform: "translate(-50%, calc(-50% + 48px))", opacity: 0 }}
            >
              <span className="lbl text-lotus">{upcoming ? "Prochain événement" : "Dernier événement"}</span>
              <p className="lbl m-0 text-[12px] sm:text-[15px]">
                {formatDate(event.date)}
                {place && <> — {place}</>}
              </p>
              <h2 className="disp text-[clamp(40px,10vw,104px)] leading-[0.9] font-extrabold tracking-[-0.02em]">
                {prefix && (
                  <>
                    {prefix}
                    <br />
                  </>
                )}
                {title}
              </h2>
              {event.lineup.length > 0 && (
                <p className="m-0 max-w-[760px] text-[15px] text-ink-muted sm:text-[19px]">
                  {b2b.length > 0 && <strong className="text-ink">{b2b.map((l) => l.name).join(" · ")}</strong>}
                  {b2b.length > 0 && others.length > 0 && " · "}
                  {others.map((l) => l.name).join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {canBuy && event.ticketUrl && (
                  <a className="btn btn-uv min-h-[52px]" href={event.ticketUrl} rel="noopener">
                    Billetterie <span aria-hidden="true">→</span>
                  </a>
                )}
                <Link className="btn btn-ghost min-h-[52px]" to={`/evenements/${event.slug}`} prefetch="intent">
                  {upcoming ? "Line-up et infos" : "Voir la fiche"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

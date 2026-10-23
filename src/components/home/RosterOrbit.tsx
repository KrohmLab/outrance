import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import type { MotionLevel } from "../../lib/useMotionLevel";
import { Reveal } from "../Reveal";
import { PETAL } from "./Lotus";
import { RosterRail } from "./RosterRail";
import { clamp01, easeOut, lerp } from "./motion-math";
import { usePageScroll } from "./usePageScroll";
import { NEUTRAL, ORBIT_ORDER, SIGNATURES } from "./signatures";

// Orbite du roster (orbitVals() de Main.dc.html) : chaque artiste fait éclore sa propre fleur, qui bat
// à son BPM indicatif ; la fleur revient au repos quand on quitte l’artiste. À la souris, survoler
// suffit ; au toucher, on touche pour ouvrir et on retouche pour fermer. En mobile, l’orbite devient
// un rail d’artistes sous la fleur.

export type OrbitArtist = { slug: string; name: string; format: string; genres: string[]; bio?: string | null; photo?: string | null };

/** Pastille d’artiste : sa photo si elle existe, sinon l’initiale. */
function Avatar({ artist }: { artist: OrbitArtist }) {
  return artist.photo ? <img src={artist.photo} alt="" loading="lazy" decoding="async" className="size-full rounded-pill object-cover" /> : <>{artist.name.charAt(0)}</>;
}

const MAX: [number, number, number] = [16, 16, 8];
const CROWNS = [
  { key: "o", fill: "var(--color-lotus)", fillOpacity: 0.05, strokeOpacity: 0.85, strokeWidth: 1.3 },
  { key: "m", fill: "var(--color-lotus-deep)", fillOpacity: 0.55, strokeOpacity: 0.9, strokeWidth: 1.3 },
  { key: "i", fill: "var(--color-lotus-deep)", fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1.5 },
] as const;

const meta = (a: OrbitArtist) => `${a.format} ◉ ${a.genres.join("/")}`;

function Flower({ slug, size }: { slug: string | null; size: number }) {
  const sg = (slug && SIGNATURES[slug]) || NEUTRAL;
  const beat = sg.bpm ? `${(60 / sg.bpm).toFixed(3)}s` : null;
  return (
    <div className="beat size-full" style={{ animation: beat ? `beat ${beat} ease-out infinite` : "breathe 5.5s ease-in-out infinite" }}>
      <svg viewBox="-300 -300 600 600" width={size} height={size} className="block size-full overflow-visible">
        <g className="orbit-spin">
          <circle className="rip" r="230" fill="none" stroke="var(--color-lotus)" strokeWidth="1.5" style={beat ? { animation: `ripple ${beat} ease-out infinite` } : { opacity: 0 }} />
          <circle r="250" fill="none" stroke="var(--color-lotus)" strokeOpacity=".18" strokeWidth="1" />
          <circle r="190" fill="none" stroke="var(--color-lotus)" strokeOpacity=".25" strokeWidth="1" strokeDasharray="2 7" />
          {CROWNS.map((c, L) => {
            const n = sg.n[L] ?? 0;
            const off = L === 0 ? 0 : 180 / n;
            return Array.from({ length: MAX[L] ?? 0 }, (_, i) => {
              const on = i < n;
              const ang = (((i % n) * 360) / n + off + sg.twist).toFixed(2);
              const [sx, sy] = on ? (sg.s[L] ?? [0, 0]) : [0, 0];
              const style: CSSProperties = {
                transform: `rotate(${ang}deg) translateY(${-(sg.d[L] ?? 0)}px) scale(${sx}, ${sy})`,
                opacity: on ? 1 : 0,
                transitionDelay: `${L * 60 + i * 14}ms`,
              };
              return (
                <path
                  key={`${c.key}${i}`}
                  className="orbit-petal"
                  d={PETAL}
                  fill={c.fill}
                  fillOpacity={c.fillOpacity}
                  stroke="var(--color-lotus)"
                  strokeOpacity={c.strokeOpacity}
                  strokeWidth={c.strokeWidth}
                  style={style}
                />
              );
            });
          })}
          <circle r="9" fill="var(--color-lotus)" style={{ transformOrigin: "0 0", transition: "transform .5s", transform: `scale(${slug ? 0 : 1})` }} />
        </g>
      </svg>
    </div>
  );
}

export function RosterOrbit({ artists, level }: { artists: OrbitArtist[]; level: MotionLevel }) {
  const ordered = [...artists].sort((a, b) => {
    const ia = ORBIT_ORDER.indexOf(a.slug);
    const ib = ORBIT_ORDER.indexOf(b.slug);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  // Survol (souris) et sélection (toucher, clavier, clic) : la sélection persiste, le survol la précède.
  const [picked, setPicked] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // Quitter un artiste ne ramène au repos qu’après un court délai : en glissant d’un artiste à son voisin,
  // la fleur et le texte passent directement de l’un à l’autre, sans clignoter par l’état neutre.
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enter = (slug: string) => {
    clearTimeout(leaveTimer.current);
    setHovered(slug);
  };
  const leave = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHovered(null), 350);
  };
  useEffect(() => () => clearTimeout(leaveTimer.current), []);
  const current = ordered.find((a) => a.slug === (hovered ?? picked)) ?? null;
  const mouse = level === "full";
  const sectionRef = useRef<HTMLElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  // Entrée liée au scroll (orbitWrap de Main.dc.html) : l’orbite tourne de −120° à 0° et grandit
  // de 45 % à 100 % pendant que la section arrive à l’écran. Desktop uniquement.
  usePageScroll(
    sectionRef,
    (st, top, vh) => {
      const el = spinRef.current;
      if (!el) return;
      const er = clamp01((st + vh - top) / vh);
      const t = easeOut(clamp01(er * 1.3 - 0.1));
      el.style.opacity = clamp01(er * 1.5 - 0.2).toFixed(3);
      el.style.transform = `scale(${lerp(0.45, 1, t).toFixed(3)}) rotate(${lerp(-120, 0, t).toFixed(1)}deg)`;
    },
    mouse,
  );
  const toggle = (slug: string) => setPicked((p) => (p === slug ? null : slug));

  // En mobile, la barre de progression du rail sert de séparateur haut : seul le filet du bas reste.
  // Hauteur fixe et bio limitée à quelques lignes (la bio complète est sur la fiche) : passer d’un artiste
  // à l’autre ne change pas la hauteur de la section, la fleur et la page ne sautent pas.
  const info = (mobile: boolean) => (
    <div
      key={current?.slug ?? "neutral"}
      className={`orbit-info flex h-[268px] flex-col gap-2.5 overflow-hidden border-line py-6 sm:h-[296px] ${mobile ? "border-b pt-3" : "border-y"}`}
      aria-live="polite"
    >
      {current ? (
        <>
          <span className="lbl text-[11px] text-lotus">{meta(current)}</span>
          <span className="disp text-[36px] leading-[0.95] font-extrabold sm:text-[56px] sm:leading-[0.92]">{current.name}</span>
          <p className="m-0 line-clamp-6 text-ink-muted sm:line-clamp-5">{current.bio ?? "Biographie à venir. [À compléter]"}</p>
        </>
      ) : (
        <>
          <p className="m-0 text-[16px] sm:text-[18px]">
            {ordered.length} artistes gravitent autour d’Outrance. {mouse ? "Survole-les" : "Touche-les"} : chacun fait éclore sa propre fleur.
          </p>
          <p className="m-0 text-[15px] text-ink-muted">
            Plus le style est rapide, plus les pétales sont nombreux, effilés et éclatés. Et la fleur bat au tempo de l’artiste.
          </p>
        </>
      )}
    </div>
  );

  const cta = (
    <div className="flex flex-wrap items-center gap-6">
      <Link
        className="btn btn-lotus min-h-12 max-sm:w-full"
        to={current ? `/artistes?artiste=${current.slug}` : "/artistes"}
        aria-label={current ? `Plus d’infos sur ${current.name}` : undefined}
        prefetch="intent"
      >
        {current ? "Plus d’infos" : "Découvrir le roster"}
      </Link>
      <Link className="lnk max-sm:hidden" to="/artistes#booking">
        Booking <span className="ar" aria-hidden="true">→</span>
      </Link>
    </div>
  );

  const portrait = (size: number) => (
    <div
      aria-hidden="true"
      className="orbit-portrait pointer-events-none absolute top-1/2 left-1/2"
      style={{ width: size, height: size, transform: `translate(-50%, -50%) scale(${current ? 1 : 0.3})`, opacity: current ? 1 : 0 }}
    >
      <div className="relative flex size-full items-center justify-center overflow-hidden rounded-pill border-2 border-lotus bg-[#1d1430] shadow-[0_0_0_8px_rgb(185_139_255/.14)]">
        {current?.photo ? (
          <img src={current.photo} alt="" decoding="async" className="absolute inset-0 size-full object-cover" />
        ) : (
          <>
            <span className="disp text-[54px] leading-none font-extrabold text-transparent [-webkit-text-stroke:1.5px_var(--color-lotus)] sm:text-[76px]">
              {current?.name.charAt(0) ?? "O"}
            </span>
            <span className="lbl absolute inset-x-0 bottom-3 text-center text-[9px] text-ink-muted sm:bottom-[18px]">[Photo]</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} aria-labelledby="home-roster" className="relative overflow-hidden pt-12 pb-4 sm:pt-24 sm:pb-12 lg:flex lg:min-h-[100vh] lg:items-center">
      <div className="wrap flex flex-col items-center gap-10 lg:flex-row lg:gap-14">
        <Reveal className="flex w-full min-w-0 flex-1 flex-col gap-5 lg:gap-[22px]">
          <span className="lbl text-lotus">Artistes</span>
          <h2 id="home-roster" className="disp text-[36px] leading-none font-bold tracking-[-0.01em] sm:text-display-l">
            Le roster
          </h2>
          <div className="max-sm:hidden">{info(false)}</div>
          <div className="max-sm:hidden">{cta}</div>
        </Reveal>

        {/* Tablette et desktop : l’orbite. */}
        <Reveal delay={150} className="orbit-wrap relative hidden size-[560px] flex-none sm:block lg:size-[640px]">
          <div ref={spinRef} className="absolute inset-0">
          <svg aria-hidden="true" viewBox="-320 -320 640 640" className="absolute inset-0 size-full">
            <circle r="270" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 8" />
          </svg>
          <div aria-hidden="true" className="absolute inset-[17%]">
            <Flower slug={current?.slug ?? null} size={420} />
          </div>
          {portrait(150)}
          <ul className="orbit-ring absolute inset-0 m-0 list-none p-0" aria-label="Artistes du roster">
            {ordered.map((a, i) => {
              const ang = (i / ordered.length) * Math.PI * 2 - Math.PI / 2;
              const on = a.slug === current?.slug;
              const dim = Boolean(current) && !on;
              return (
                <li
                  key={a.slug}
                  className="absolute"
                  style={{ left: `${50 + 42.2 * Math.cos(ang)}%`, top: `${50 + 42.2 * Math.sin(ang)}%`, transform: "translate(-50%, -32px)", zIndex: on ? 2 : 1 }}
                >
                  <button
                    type="button"
                    aria-pressed={picked === a.slug}
                    aria-label={`${a.name} — ${meta(a)}`}
                    onClick={() => toggle(a.slug)}
                    onMouseEnter={mouse ? () => enter(a.slug) : undefined}
                    onMouseLeave={mouse ? leave : undefined}
                    className="orbit-node flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0 text-ink"
                  >
                    <span
                      className="disp flex size-16 items-center justify-center overflow-hidden rounded-pill bg-[#1d1430] text-[26px] font-extrabold"
                      style={{
                        border: `2px solid ${on ? "var(--color-lotus)" : "var(--color-line)"}`,
                        color: on ? "var(--color-ink)" : "var(--color-lotus)",
                        boxShadow: `0 0 0 ${on ? 8 : 0}px rgb(185 139 255 / .18)`,
                        opacity: dim ? 0.55 : 1,
                        transform: `scale(${on ? 1.5 : dim ? 0.9 : 1})`,
                        transition: "background .3s, color .3s, border-color .3s, box-shadow .3s, opacity .3s, transform .55s cubic-bezier(.3,1.35,.5,1)",
                      }}
                    >
                      <Avatar artist={a} />
                    </span>
                    <span className="lbl text-[10px] whitespace-nowrap" style={{ color: on ? "var(--color-lotus)" : "var(--color-ink-muted)", transform: `translateY(${on ? 18 : 0}px)`, transition: "color .3s, transform .4s" }}>
                      {a.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          </div>
        </Reveal>

        {/* Mobile : la fleur, puis un rail d’artistes au toucher. */}
        <div className="flex w-full flex-col gap-4 sm:hidden">
          <div aria-hidden="true" className="relative mx-auto size-[300px]">
            <Flower slug={current?.slug ?? null} size={300} />
            {portrait(110)}
          </div>
          <RosterRail label="Choisir un artiste">
            {ordered.map((a) => {
              const on = a.slug === current?.slug;
              return (
                <button
                  key={a.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(a.slug)}
                  className="flex w-[72px] flex-none snap-start cursor-pointer flex-col items-center gap-2 border-0 bg-transparent py-1.5 text-ink"
                >
                  <span
                    className="disp flex size-14 items-center justify-center overflow-hidden rounded-pill bg-[#1d1430] text-[22px] font-extrabold transition-colors"
                    style={{ border: `2px solid ${on ? "var(--color-lotus)" : "var(--color-line)"}`, color: on ? "var(--color-ink)" : "var(--color-lotus)" }}
                  >
                    <Avatar artist={a} />
                  </span>
                  <span className={`lbl text-[10px] ${on ? "text-lotus" : "text-ink-muted"}`}>{a.name}</span>
                </button>
              );
            })}
          </RosterRail>
          {info(true)}
          {cta}
        </div>
      </div>
    </section>
  );
}

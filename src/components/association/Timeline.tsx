import { useEffect, useRef } from "react";
import type { TimelineStep } from "../../content/schemas";
import { SectionHeading } from "./SectionHeading";

// Timeline « Les grandes étapes » (brand book, Mouvement §7) : la ligne se trace au fil du scroll
// et chaque date s’allume quand elle est atteinte, sur tous les écrans (le brand book prévoyait une
// révélation unique sur tactile ; liée au scroll partout à la demande de l’équipe, octobre 2026).
// Une variable CSS --tl-p (0 → 1) est posée sur le seul remplissage, et data-on sur chaque étape,
// au plus une fois par image et seulement quand la section est à l’écran. Une étape s’allume quand sa
// pastille passe la ligne des 55 % du viewport, là où se trouve aussi le bout du tracé (et s’éteint
// si l’on remonte).
// Mouvement réduit ou sans JavaScript : état final (ligne tracée, étapes allumées).
// Aucun setState. L’état éteint reste lisible (date et titre en ink-muted, contraste ≈ 8:1 sur nuit),
// seule l’opacité de la pastille pleine varie.

const LINE = 0.55; // position du bout du tracé, en fraction de la hauteur du viewport

type Props = { steps: TimelineStep[]; intro?: string };

export function Timeline({ steps, intro }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    const list = listRef.current;
    if (!rail || !fill || !list || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(list.children) as HTMLElement[];
    const dots = items.map((li) => li.querySelector<HTMLElement>("[data-dot]"));

    // Pose l’état initial sans transition, pour ne pas animer ce qui est déjà à l’écran à l’hydratation.
    rail.dataset.tlInit = "";
    let initFrame = requestAnimationFrame(() => {
      initFrame = requestAnimationFrame(() => delete rail.dataset.tlInit);
    });

    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * LINE;
      const r = rail.getBoundingClientRect();
      const p = r.height > 0 ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 1;
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        fill.style.setProperty("--tl-p", p.toFixed(4));
      }
      items.forEach((li, i) => {
        const v = (dots[i]?.getBoundingClientRect().top ?? 0) < line ? "1" : "0";
        if (li.dataset.on !== v) li.dataset.on = v;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();

    // Écoute du scroll seulement quand la timeline est à l’écran.
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };
    const sectionIo = new IntersectionObserver(([e]) => {
      listen(Boolean(e?.isIntersecting));
      schedule(); // dernière mise à jour en entrant ou en sortant (0 ou 1)
    });
    sectionIo.observe(rail);

    return () => {
      sectionIo.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(initFrame);
      delete rail.dataset.tlInit;
      fill.style.removeProperty("--tl-p");
      for (const li of items) delete li.dataset.on;
    };
  }, []);

  return (
    <section
      aria-labelledby="etapes-titre"
      className="wrap flex flex-col gap-7 py-14 sm:gap-9 sm:py-20 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] lg:gap-14 lg:py-24"
    >
      <div className="flex flex-col gap-3 lg:gap-4">
        <SectionHeading id="etapes-titre" label="Les grandes étapes" title="De Lyon à la Belgique" className="lg:gap-4" />
        {intro && <p className="m-0 text-[15px] text-ink-muted sm:text-body">{intro}</p>}
      </div>

      <div
        ref={railRef}
        className="relative ml-2 self-start border-l-[1.5px] border-line pl-6 data-tl-init:**:transition-none sm:pl-7 lg:ml-0"
      >
        {/* Tracé lotus par-dessus le filet : scaleY(--tl-p), jamais la hauteur. */}
        <span
          ref={fillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 -left-[1.75px] w-[2px] origin-top bg-lotus"
          style={{ transform: "scaleY(var(--tl-p, 1))" }}
        />
        <ol ref={listRef} className="m-0 flex list-none flex-col gap-7 p-0 sm:gap-8 lg:gap-9">
          {steps.map((s) => (
            <li key={s.date + s.title} className="group relative flex flex-col gap-1 sm:gap-1.5">
              <span
                data-dot=""
                aria-hidden="true"
                className="absolute top-0.5 -left-[33px] size-4 rounded-pill border-2 border-lotus bg-nuit sm:top-[3px] sm:-left-[37px]"
              >
                {/* Halo et pastille pleine : opacité et échelle seulement. */}
                <span className="absolute -inset-2 rounded-pill bg-lotus/18 transition-[opacity,scale] duration-500 ease-nuit group-data-[on=0]:scale-50 group-data-[on=0]:opacity-0" />
                <span className="absolute inset-0 rounded-pill bg-lotus transition-[scale] duration-400 ease-nuit group-data-[on=0]:scale-0" />
              </span>
              <time
                dateTime={s.date}
                className="lbl text-[11px] text-lotus transition-colors duration-400 group-data-[on=0]:text-ink-muted sm:text-[12px] lg:text-[13px]"
              >
                {s.label}
              </time>
              <h3 className="disp text-[16px] leading-[1.15] font-semibold transition-[color,translate] duration-400 ease-nuit group-data-[on=0]:translate-x-2 group-data-[on=0]:text-ink-muted sm:text-[18px] lg:text-[19px]">
                {s.title}
              </h3>
              <p className="m-0 text-[15px] text-ink-muted sm:text-body">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

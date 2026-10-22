import { useState } from "react";
import { Link } from "react-router";
import { LotusBloom } from "../components/LotusBloom";
import { site } from "../site";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
  { title: `Page introuvable — ${site.name}` },
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative flex min-h-[min(760px,calc(100svh-68px))] items-center overflow-hidden">
      <span
        aria-hidden="true"
        className="disp pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 text-[clamp(200px,34vw,480px)] leading-none font-extrabold whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_var(--color-line)]"
      >
        404
      </span>
      <div className="wrap relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-12 py-20">
        <div className="flex flex-col gap-[22px]">
          <span className="lbl text-lotus">Erreur 404</span>
          <h1 className="disp text-[clamp(36px,5vw,64px)] leading-[0.98] font-extrabold">Cette page n’a pas éclos</h1>
          <p className="m-0 max-w-[480px] text-lg text-ink-muted">
            Elle s’est sûrement perdue entre deux drops. Clique sur le lotus pour te consoler, ou reprends le chemin du
            dancefloor.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Link className="btn btn-lotus min-h-[52px]" to="/agenda">
              Voir l’agenda
            </Link>
            <Link className="lnk" to="/">
              Retour à l’accueil <span className="ar" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-pressed={open}
          aria-label="Faire éclore le lotus"
          className="aspect-square w-[min(100%,460px)] cursor-pointer justify-self-center rounded-pill border-0 bg-transparent p-0"
        >
          <LotusBloom open={open} />
        </button>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { LotusBloom } from "../components/LotusBloom";
import { Mandala } from "../components/Mandala";
import { Newsletter } from "../components/Newsletter";
import { site } from "../site";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: `${site.name} — ${site.tagline}` },
  { name: "description", content: site.metaDescription },
];

// Accueil provisoire : l’accueil animé (Main.dc.html) arrive à l’étape 3.
export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[300px] -right-[300px] size-[900px] opacity-35"
      >
        <Mandala />
      </div>
      <div className="wrap relative grid min-h-[calc(100svh-68px)] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-12 py-16 sm:py-24">
        <div className="flex flex-col gap-6">
          <span className="lbl text-lotus">{site.tagline}</span>
          <h1 className="disp text-[clamp(44px,12vw,96px)] leading-[0.92] font-extrabold tracking-[-0.02em]">
            {site.name}
          </h1>
          <p className="m-0 max-w-[560px] text-body-l text-ink-muted">{site.association.intro}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Link className="btn btn-lotus min-h-[52px]" to="/agenda">
              Voir l’agenda
            </Link>
            <Link className="lnk" to="/association">
              L’association <span className="ar" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="w-[min(100%,460px)] justify-self-center">
          <LotusBloom open />
        </div>
      </div>
      <div className="wrap relative pb-16 sm:pb-24">
        <Newsletter id="newsletter" />
      </div>
    </section>
  );
}

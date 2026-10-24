import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LotusBloom } from "../components/LotusBloom";
import { SocialLinks } from "../components/SocialLinks";
import { site } from "../site";
import type { Route } from "./+types/newsletter-confirmee";
import { pageMeta } from "../lib/seo";

// Page d’arrivée après le clic dans l’e-mail de confirmation beehiiv (« Opt in redirect URL »).
// Hors sitemap et non indexée : elle n’a de sens qu’en venant de cet e-mail.
export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: `Inscription confirmée — ${site.name}`,
    description: "Ton inscription à la newsletter d’Outrance est confirmée.",
    path: "/newsletter/confirmee",
    noindex: true,
  });

export default function NewsletterConfirmee() {
  // Le lotus éclot à l’arrivée (état final directement en mouvement réduit, géré par LotusBloom).
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-[min(760px,calc(100svh-68px))] items-center overflow-hidden">
      <div className="wrap relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-12 py-20">
        <div className="flex flex-col gap-[22px]">
          <span className="lbl text-lotus">Newsletter</span>
          <h1 className="disp text-[clamp(36px,5vw,64px)] leading-[0.98] font-extrabold">Bienvenue dans la tribu</h1>
          <p className="m-0 max-w-[480px] text-lg text-ink-muted">
            Ton adresse est confirmée. Les prochaines dates, les line-up et l’ouverture des billetteries arriveront
            d’abord dans ta boîte mail. Promis, on ne te spammera pas.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Link className="btn btn-lotus min-h-[52px]" to="/agenda">
              Voir l’agenda
            </Link>
            <Link className="lnk" to="/">
              Retour à l’accueil <span className="ar" aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <span className="lbl text-[11px] text-ink-muted">En attendant, retrouve-nous sur les réseaux</span>
            <SocialLinks />
          </div>
        </div>
        <div aria-hidden="true" className="aspect-square w-[min(100%,460px)] justify-self-center">
          <LotusBloom open={open} />
        </div>
      </div>
    </section>
  );
}

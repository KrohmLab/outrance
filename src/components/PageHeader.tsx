import type { ReactNode } from "react";
import { Mandala } from "./Mandala";

// En-tête des pages intérieures : label lotus, grand titre, chapô, mandala décoratif en haut à droite.
type Props = {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Contenu ajouté sous le chapô (onglets, filtres…). */
  children?: ReactNode;
};

export function PageHeader({ label, title, intro, children }: Props) {
  return (
    // Rognée sur les côtés seulement : la rosace descend entière derrière la suite de la page
    // (-z-10 dans le contexte de <main>, sous le contenu et sous les fonds des cartes).
    <section className="relative overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute -top-[300px] -right-[300px] -z-10 hidden size-[900px] opacity-35 sm:block">
        <Mandala />
      </div>
      <div className="wrap relative flex flex-col gap-8 pt-12 pb-5 sm:pt-[88px] sm:pb-12">
        <div className="flex max-w-[760px] flex-col gap-4 sm:gap-5">
          <span className="lbl reveal text-lotus">{label}</span>
          <h1 className="disp reveal reveal-d1 text-[clamp(44px,8vw,112px)] leading-[0.9] font-extrabold tracking-[-0.02em]">
            {title}
          </h1>
          {intro && <div className="reveal reveal-d2 m-0 text-body-l text-ink-muted">{intro}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

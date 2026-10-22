import type { ReactNode } from "react";
import { CameraIcon, DocumentIcon } from "../icons";
import { logoUrl } from "../../site";

// Kit presse (Presse-pro.dc.html) : trois cartes-liens. Survol limité aux appareils à souris (variante hover de Tailwind),
// état reproduit au focus clavier.
type Arrow = "external" | "right";

const ARROWS: Record<Arrow, { glyph: string; move: string }> = {
  external: { glyph: "↗", move: "group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" },
  right: { glyph: "→", move: "group-hover:translate-x-[5px]" },
};

type CardProps = {
  href: string;
  visual: ReactNode;
  title: string;
  text: string;
  action: string;
  arrow: Arrow;
  external?: boolean;
  className?: string;
};

function KitCard({ href, visual, title, text, action, arrow, external, className = "" }: CardProps) {
  const { glyph, move } = ARROWS[arrow];
  return (
    <li className={`flex ${className}`}>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
        className="group flex min-h-[200px] flex-1 flex-col gap-3 rounded-md bg-nuit-raised p-6 text-ink no-underline transition-[background-color,translate] duration-300 hover:-translate-y-1 hover:bg-lotus-deep hover:text-ink focus-visible:bg-lotus-deep sm:min-h-[280px] sm:p-7"
      >
        {visual}
        <h3 className="disp text-[20px] leading-[1.15] font-semibold">{title}</h3>
        <p className="m-0 text-ink-muted">{text}</p>
        <span className="lnk mt-auto">
          {action}
          {external && <span className="sr-only"> (nouvel onglet)</span>}
          <span aria-hidden="true" className={`inline-block transition-[translate] duration-[250ms] ${move}`}>
            {glyph}
          </span>
        </span>
      </a>
    </li>
  );
}

const badge =
  "flex size-14 items-center justify-center rounded-pill bg-lotus-deep text-lotus transition-colors duration-300 group-hover:bg-lotus group-hover:text-nuit group-focus-visible:bg-lotus group-focus-visible:text-nuit";

type Props = { pressKitUrl: string; logosUrl: string; contactEmail: string };

export function PressKit({ pressKitUrl, logosUrl, contactEmail }: Props) {
  const photosHref = `mailto:${contactEmail}?subject=${encodeURIComponent("Demande de photos HD")}`;
  return (
    <section aria-labelledby="kit-presse" className="wrap pb-16 sm:pb-[88px]">
      <h2 id="kit-presse" className="sr-only">
        Kit presse
      </h2>
      <ul role="list" className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <KitCard
          href={pressKitUrl}
          external
          visual={
            <span aria-hidden="true" className={badge}>
              <DocumentIcon />
            </span>
          }
          title="Dossier de présentation"
          text="Histoire, chiffres, événements phares et références."
          action="Ouvrir le PDF"
          arrow="external"
        />
        <KitCard
          href={logosUrl}
          external
          visual={
            <span className="flex h-14 items-center">
              <img src={logoUrl} alt="" className="block h-[22px] w-auto" />
            </span>
          }
          title="Logos"
          text="Wordmark blanc en PNG haute définition. Version SVG et version sombre bientôt disponibles."
          action="Ouvrir le dossier"
          arrow="external"
        />
        {/* En tablette, la 3e carte prend toute la largeur plutôt que de rester orpheline à gauche. */}
        <KitCard
          href={photosHref}
          visual={
            <span aria-hidden="true" className={badge}>
              <CameraIcon />
            </span>
          }
          title="Photos HD"
          text="Sur demande, avec les crédits des photographes à mentionner."
          action="Nous écrire"
          arrow="right"
          className="sm:max-lg:col-span-2 sm:max-lg:[&>a]:min-h-0"
        />
      </ul>
    </section>
  );
}

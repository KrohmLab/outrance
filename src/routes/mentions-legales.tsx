import { BoldLead, LegalSection } from "../components/legal/LegalSection";
import { LegalToc, type TocItem } from "../components/legal/LegalToc";
import { aftermovies, galerie, legal, site } from "../content/load.server";
import { site as clientSite } from "../site";
import type { Route } from "./+types/mentions-legales";
import { pageMeta } from "../lib/seo";

const unique = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => Boolean(v)))];

export function loader() {
  return {
    legal: {
      publisher: legal.publisher,
      address: legal.address,
      rna: legal.rna,
      siren: legal.siren,
      publicationDirector: legal.publicationDirector,
      host: legal.host,
      newsletterProvider: legal.newsletterProvider,
    },
    contactEmail: site.emails.contact,
    aftermovieCredits: unique(aftermovies.map((m) => m.credit)),
    photographers: unique(galerie.albums.map((a) => a.photographer)),
  };
}

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: `Mentions légales — ${clientSite.name}`,
    description: "Mentions légales du site d’Outrance : éditeur, hébergement, propriété intellectuelle, données personnelles et cookies.",
    path: "/mentions-legales",
  });

// Ids repris de la maquette (la redirection /politique-de-cookies-ue/ vise #cookies).
const TOC: TocItem[] = [
  { id: "editeur", label: "Éditeur" },
  { id: "hebergement", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "donnees", label: "Données personnelles" },
  { id: "cookies", label: "Cookies" },
  { id: "credits", label: "Crédits" },
];

export default function MentionsLegales({ loaderData }: Route.ComponentProps) {
  const { legal, contactEmail, aftermovieCredits, photographers } = loaderData;
  const mail = <a href={`mailto:${contactEmail}`}>{contactEmail}</a>;

  return (
    <div className="leading-[1.7]">
      <section className="wrap flex flex-col gap-4 pt-14 pb-10 sm:pt-20">
        <p className="lbl m-0 text-lotus">Informations légales</p>
        <h1 className="disp text-[clamp(40px,6vw,80px)] leading-[0.94] font-extrabold tracking-[-0.02em]">Mentions légales</h1>
        {/* Aucune date dans content/legal.json : placeholder visible jusqu’à la mise en ligne. */}
        <p className="lbl m-0 text-[12px] text-ink-muted">Dernière mise à jour : [date de mise en ligne]</p>
      </section>

      <div className="wrap flex flex-col gap-10 pb-16 sm:pb-24 lg:flex-row lg:items-start lg:gap-16">
        <LegalToc items={TOC} />
        <article className="min-w-0 max-w-[760px] lg:flex-1 [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:[overflow-wrap:anywhere] [&_p]:mt-0 [&_p]:mb-3 [&_p]:text-ink-muted [&_strong]:text-ink">
          <LegalSection id="editeur" title="Éditeur du site">
            <p>
              <BoldLead text={legal.publisher} split={/, /} />.
              <br />
              Siège : {legal.address}.
              <br />
              RNA : {legal.rna} — SIREN : {legal.siren}.
            </p>
            <p>
              Directeur de la publication : <strong>{legal.publicationDirector ?? "[Nom et prénom du président]"}</strong>.
              <br />
              Contact : {mail}
            </p>
          </LegalSection>

          <LegalSection id="hebergement" title="Hébergement">
            <p>
              Site hébergé par <BoldLead text={legal.host} split={/, (?=\d)/} />.
            </p>
          </LegalSection>

          <LegalSection id="propriete" title="Propriété intellectuelle">
            <p>
              Le logo, les textes et la charte graphique d’Outrance sont la propriété de l’association. Les photos et vidéos
              restent la propriété de leurs auteurs. Toute reproduction sans autorisation est interdite.
            </p>
          </LegalSection>

          <LegalSection id="donnees" title="Données personnelles">
            <p>
              Ce site ne collecte lui-même aucune donnée personnelle. Pour un booking ou toute autre demande, nos adresses
              e-mail ouvrent ta propre messagerie : ton message nous parvient comme n’importe quel e-mail, et ce que tu nous y
              transmets sert seulement à te répondre. Ces informations ne sont jamais revendues.
            </p>
            <p>
              Le formulaire de newsletter ne te demande que ton adresse e-mail. Il n’est pas encore en service : rien n’est
              enregistré pour l’instant. Une fois ouvert, ton adresse servira uniquement à t’informer de nos événements. La
              newsletter sera gérée par <strong>{legal.newsletterProvider ?? "[prestataire à préciser]"}</strong>, et tu
              pourras te désinscrire à tout moment depuis chaque e-mail.
            </p>
            <p>
              Conformément au RGPD, tu disposes d’un droit d’accès, de rectification et de suppression de tes données : écris
              à {mail}.
            </p>
          </LegalSection>

          <LegalSection id="cookies" title="Cookies">
            <p>
              <strong>Ce site n’utilise aucun cookie</strong> : c’est pourquoi aucune bannière ne te demande ton consentement.
              Si une mesure d’audience est ajoutée, elle sera anonyme et ne déposera rien sur ton appareil.
            </p>
            <p>
              Les vidéos YouTube ne se chargent qu’au moment où tu cliques sur Lecture, en mode de confidentialité renforcée
              (youtube-nocookie.com). Avant ce clic, rien n’est chargé depuis YouTube. Une fois la vidéo lancée, YouTube peut
              enregistrer ses propres informations sur ton appareil, selon ses règles de confidentialité.
            </p>
          </LegalSection>

          <LegalSection id="credits" title="Crédits">
            <p>
              Conception et développement : équipe Outrance.
              {photographers.length > 0 && <> Photos : {photographers.join(", ")}.</>}
              {aftermovieCredits.length > 0 && <> Aftermovies : {aftermovieCredits.join(", ")}.</>}
            </p>
          </LegalSection>
        </article>
      </div>
    </div>
  );
}

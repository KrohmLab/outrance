import { PageHeader } from "../components/PageHeader";
import { Contacts } from "../components/presse/Contacts";
import { InBrief, type StatTile } from "../components/presse/InBrief";
import { PressKit } from "../components/presse/PressKit";
import { Venues } from "../components/presse/Venues";
import { presse, site } from "../content/load.server";
import { site as clientSite } from "../site";
import type { Route } from "./+types/presse-pro";

export function loader() {
  // Année de création + chiffres renseignés (les valeurs null restent masquées).
  const stats: StatTile[] = [
    { value: site.association.founded.slice(0, 4), label: `Création à ${site.association.city}` },
    ...site.stats.flatMap((s) => (s.value === null ? [] : [{ value: String(s.value), label: s.label }])),
  ];
  return { presse, stats, contactEmail: site.emails.contact };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const title = `Presse / Pro — ${clientSite.name}`;
  const description = loaderData?.presse.blurbs.short ?? clientSite.metaDescription;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${clientSite.url}/presse-pro` },
  ];
};

export default function PressePro({ loaderData }: Route.ComponentProps) {
  const { presse, stats, contactEmail } = loaderData;
  return (
    <>
      <PageHeader
        label="Organisateurs, lieux, médias"
        title={"Presse / Pro"}
        intro={
          <p className="m-0 max-w-[720px]">
            Tout ce qu’il faut pour parler d’Outrance ou travailler avec nous : dossier de présentation, logos, textes prêts à
            l’emploi et bons interlocuteurs.
          </p>
        }
      />
      <PressKit pressKitUrl={presse.pressKitUrl} logosUrl={presse.logosUrl} contactEmail={contactEmail} />
      <InBrief blurbs={presse.blurbs} stats={stats} />
      <Contacts contacts={presse.contacts} />
      <Venues venues={presse.venues} />
    </>
  );
}

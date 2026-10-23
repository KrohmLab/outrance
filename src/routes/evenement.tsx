import type { CSSProperties } from "react";
import { data } from "react-router";
import { EventHero } from "../components/evenement/EventHero";
import { eventJsonLd, eventStatus, metaDescription } from "../components/evenement/event-data";
import { InfoPanel } from "../components/evenement/InfoPanel";
import { Lineup } from "../components/evenement/Lineup";
import { NewsletterCta } from "../components/evenement/NewsletterCta";
import { StickyTicketBar } from "../components/evenement/StickyTicketBar";
import { artists, galerie, getEvent, site } from "../content/load.server";
import { fullTitle } from "../lib/calendar";
import { formatDate, isUpcoming } from "../lib/dates";
import { useNow } from "../lib/useNow";
import { site as clientSite } from "../site";
import type { Route } from "./+types/evenement";
import { pageMeta } from "../lib/seo";

// Fiche événement (Evenement.dc.html, -tablette, -mobile), pré-rendue pour chaque slug publié.
export async function loader({ params }: Route.LoaderArgs) {
  const event = getEvent(params.slug);
  if (!event) throw data(null, { status: 404 });
  const roster = artists.filter((a) => event.rosterSlugs.includes(a.slug)).map(({ slug, name }) => ({ slug, name }));
  const hasPhotos = galerie.albums.some((a) => a.event === event.slug && a.photos.length > 0);
  const url = `${site.url}/evenements/${event.slug}`;
  return {
    event,
    roster,
    hasPhotos,
    description: metaDescription(event),
    jsonLd: eventJsonLd(event, url, { name: site.name, url: site.url }),
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: `Événement introuvable — ${clientSite.name}` }, { name: "robots", content: "noindex" }];
  const { event } = loaderData;
  return [
    ...pageMeta({
      title: `${fullTitle(event)} — ${clientSite.name}`,
      description: loaderData.description,
      path: `/evenements/${event.slug}`,
      image: `/og/evenements/${event.slug}.png`,
      imageAlt: `${fullTitle(event)}, ${formatDate(event.date)}`,
      type: "article",
    }),
    { "script:ld+json": loaderData.jsonLd },
  ];
};

export default function Evenement({ loaderData }: Route.ComponentProps) {
  const { event, roster, hasPhotos } = loaderData;
  const now = useNow();
  const upcoming = isUpcoming(event, now);
  const status = eventStatus(event, upcoming);
  const canBuy = upcoming && Boolean(event.ticketUrl) && event.ticketStatus !== "soldOut";
  const hasBar = canBuy;
  // Le toast remonte au-dessus de la barre collante en mobile.
  const style = hasBar ? ({ "--toast-offset": "72px" } as CSSProperties) : undefined;

  return (
    <div style={style}>
      <EventHero event={event} status={status} upcoming={upcoming} canBuy={canBuy} hasBar={hasBar} hasPhotos={hasPhotos} />

      <section className="border-t border-line">
        <div className="wrap flex flex-col gap-10 py-12 sm:py-[72px] lg:flex-row lg:flex-wrap lg:items-start lg:gap-14 lg:py-20">
          {event.bodyHtml && (
            <div className="order-2 flex min-w-0 flex-col gap-4 sm:order-1 sm:gap-5 lg:flex-[999_1_560px] lg:gap-6">
              <span className="lbl text-lotus">Description</span>
              <div
                className="event-body flex flex-col gap-4 text-ink-muted [&_a]:underline [&_p]:m-0 [&>p:first-child]:text-[18px] [&>p:first-child]:leading-[1.5] [&>p:first-child]:text-ink sm:[&>p:first-child]:text-[20px] lg:text-[17px] lg:[&>p:first-child]:text-[21px]"
                dangerouslySetInnerHTML={{ __html: event.bodyHtml }}
              />
            </div>
          )}
          <InfoPanel
            event={event}
            upcoming={upcoming}
            canBuy={canBuy}
            hasBar={hasBar}
            className={`order-1 sm:order-2 ${event.bodyHtml ? "lg:flex-[1_1_380px]" : "lg:max-w-[880px] lg:flex-1"}`}
          />
        </div>
      </section>

      <Lineup lineup={event.lineup} roster={roster} decoration={event.decoration} />
      <NewsletterCta />
      {hasBar && event.ticketUrl && <StickyTicketBar title={fullTitle(event)} date={event.date} price={event.price} ticketUrl={event.ticketUrl} />}
    </div>
  );
}

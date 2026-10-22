import { useRouteLoaderData } from "react-router";
import type { OutranceEvent } from "../content/schemas";
import { featuredEvent, isUpcoming } from "./dates";
import { useNow } from "./useNow";

/** Champs d’un événement utiles au layout commun (header, menu), fournis par le loader racine. */
export type EventSummary = Pick<
  OutranceEvent,
  "slug" | "title" | "titlePrefix" | "date" | "start" | "end" | "venue" | "city" | "country" | "ticketUrl" | "ticketStatus"
>;

export function toSummary(e: OutranceEvent): EventSummary {
  const { slug, title, titlePrefix, date, start, end, venue, city, country, ticketUrl, ticketStatus } = e;
  return { slug, title, titlePrefix, date, start, end, venue, city, country, ticketUrl, ticketStatus };
}

/** Prochain événement à venir, sinon le dernier passé (calculé en heure de Paris). */
export function useFeaturedEvent() {
  const data = useRouteLoaderData("root") as { events: EventSummary[] } | undefined;
  const now = useNow();
  return featuredEvent(data?.events ?? [], now);
}

/** Cible du bouton BILLETTERIE du layout : la fiche du prochain événement, sinon l’agenda. */
export function useTicketingHref() {
  const featured = useFeaturedEvent();
  return featured?.upcoming ? `/evenements/${featured.event.slug}` : "/agenda";
}

export { isUpcoming };

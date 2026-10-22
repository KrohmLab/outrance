import type { ReactNode } from "react";
import type { OutranceEvent } from "../../content/schemas";
import { place } from "../../lib/calendar";
import { formatDate, formatHours } from "../../lib/dates";
import { CalendarIcon, ClockIcon, NoMinorsIcon, PinIcon, TicketIcon } from "../icons";
import { mapsUrl } from "./event-data";

// Encart « Infos pratiques » (aside lotus-deep). Liste en colonne étroite (desktop, mobile),
// grille de 2 colonnes quand l’encart est large (tablette, ou desktop sans description) :
// requête de conteneur plutôt que point de rupture.

type Row = { key: string; icon: ReactNode; content: ReactNode; className?: string };

const ICON = "flex-none text-lotus size-5 sm:size-[22px]";

type Props = {
  event: OutranceEvent;
  upcoming: boolean;
  canBuy: boolean;
  /** Le tarif est déjà dans la barre collante en mobile. */
  hasBar: boolean;
  className?: string;
};

export function InfoPanel({ event, upcoming, canBuy, hasBar, className = "" }: Props) {
  const hours = formatHours(event.start, event.end);
  const where = place(event);
  const maps = mapsUrl(event);

  const rows: Row[] = [{ key: "date", icon: <CalendarIcon className={ICON} />, content: formatDate(event.date) }];
  if (hours) rows.push({ key: "hours", icon: <ClockIcon className={ICON} />, content: hours });
  // Tarif : seulement pour un événement à venir (« Tarif à venir » si inconnu).
  if (upcoming) {
    rows.push({
      key: "price",
      icon: <TicketIcon className={ICON} />,
      content: event.price ?? "Tarif à venir",
      className: hasBar ? "max-sm:hidden" : "",
    });
  }
  if (where) {
    rows.push({
      key: "place",
      icon: <PinIcon className={ICON} />,
      content: (
        <span className="flex flex-col">
          {where}
          {maps && (
            <a className="inline-flex min-h-11 items-center self-start text-[14px] font-semibold" href={maps} rel="noopener">
              Voir l’itinéraire&nbsp;<span aria-hidden="true">↗</span>
            </a>
          )}
        </span>
      ),
    });
  }
  if (event.minors === false) {
    rows.push({ key: "minors", icon: <NoMinorsIcon className={ICON} />, content: "Mineurs non autorisés" });
  }

  // En grille, la dernière rangée (1 ou 2 cellules) n’a pas de filet.
  const lastPair = rows.length % 2 === 0 ? 2 : 1;

  return (
    <aside
      aria-labelledby="infos-pratiques"
      className={`@container flex flex-col rounded-md bg-lotus-deep p-5 sm:px-8 sm:py-7 lg:p-8 ${className}`}
    >
      <h2 id="infos-pratiques" className="disp mb-1 text-[15px] font-bold tracking-[0.04em] sm:mb-2 sm:text-[17px] lg:mb-3 lg:text-[18px]">
        Infos pratiques
      </h2>
      <ul className="m-0 grid list-none grid-cols-1 p-0 @xl:grid-cols-2 @xl:gap-x-8">
        {rows.map((row, i) => (
          <li
            key={row.key}
            className={`flex items-center gap-3 border-b border-lotus/15 py-3 text-[15px] sm:gap-3.5 sm:py-3.5 sm:text-base ${
              i === rows.length - 1 ? "border-b-0" : ""
            } ${i >= rows.length - lastPair ? "@xl:border-b-0" : ""} ${row.className ?? ""}`}
          >
            {row.icon}
            {row.content}
          </li>
        ))}
      </ul>
      {canBuy && event.ticketUrl && (
        <a className="btn btn-ghost mt-4 hidden border-lotus lg:inline-flex @xl:self-start" href={event.ticketUrl} rel="noopener">
          Prendre ma place
        </a>
      )}
    </aside>
  );
}

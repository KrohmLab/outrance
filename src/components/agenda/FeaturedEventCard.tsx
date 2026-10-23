import { Fragment } from "react";
import { Link } from "react-router";
import { CalendarMenu } from "../EventMenus";
import { Placeholder } from "../Placeholder";
import { StatusTag } from "../Tag";
import { place } from "../../lib/calendar";
import { dateBadge, formatDate } from "../../lib/dates";
import type { AgendaEvent } from "./agenda-data";

/** Pastille de date lotus : jour et mois court (décorative, la date complète est lue à côté). */
function DateBadge({ date }: { date: string }) {
  const { day, month } = dateBadge(date);
  return (
    <span
      aria-hidden="true"
      className="disp flex size-16 flex-none flex-col items-center justify-center rounded-pill bg-lotus text-[22px] leading-none font-extrabold text-nuit sm:size-[92px] sm:text-[32px]"
    >
      {day}
      <span className="lbl text-[10px]">{month}</span>
    </span>
  );
}

/** Visuel 1920×1005 de l’événement, ou le Placeholder de la maquette. */
export function EventVisual({ event, className = "", zoom = false }: { event: AgendaEvent; className?: string; zoom?: boolean }) {
  if (event.cover) {
    return (
      <div className={`overflow-hidden bg-placeholder ${className}`}>
        <img src={event.cover} alt="" loading="lazy" className={`size-full object-cover ${zoom ? "zoom" : ""}`} />
      </div>
    );
  }
  return (
    <Placeholder zoom={zoom} className={className}>
      <span className="lbl relative text-[10px] text-ink-muted sm:text-[11px]">
        <span className="sm:hidden">[Visuel]</span>
        <span className="hidden sm:inline">[Visuel de l’événement — 1920×1005]</span>
      </span>
    </Placeholder>
  );
}

/** Line-up séparé par « · » ; les B2B en gras (desktop et tablette), comme la maquette. */
function Lineup({ lineup }: { lineup: AgendaEvent["lineup"] }) {
  if (lineup.length === 0) return null;
  return (
    <p className="m-0 text-[15px] text-ink-muted sm:text-base">
      {lineup.map((a, i) => (
        <Fragment key={a.name}>
          {i > 0 && " · "}
          {a.format === "B2B" ? <strong className="font-semibold sm:font-bold sm:text-ink">{a.name}</strong> : a.name}
        </Fragment>
      ))}
    </p>
  );
}

/** Grande carte du prochain événement : seule action uv de la page (Billetterie). */
export function FeaturedEventCard({ event }: { event: AgendaEvent }) {
  const href = `/evenements/${event.slug}`;
  const where = place(event);
  return (
    <article className="card grid hover:transform-none lg:grid-cols-2">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[1920/1005] lg:aspect-auto lg:min-h-full">
        <EventVisual event={event} className="absolute inset-0" />
      </Link>
      <div className="flex flex-col gap-3.5 p-5 sm:gap-[18px] sm:p-9">
        <div className="flex items-center gap-3.5 sm:gap-5">
          <DateBadge date={event.date} />
          <span className="flex flex-col items-start sm:gap-1">
            <span className="lbl text-[11px] sm:text-[13px]">{formatDate(event.date)}</span>
            {where && <span className="lbl text-[11px] text-ink-muted sm:text-[13px]">{where}</span>}
            {event.ticketStatus && <StatusTag status={event.ticketStatus} className="mt-2" />}
          </span>
        </div>
        <h2 className="disp text-[26px] leading-none font-extrabold sm:text-[40px] sm:leading-[0.98]">
          <Link to={href} className="text-ink no-underline hover:text-ink">
            {event.title}
          </Link>
        </h2>
        <Lineup lineup={event.lineup} />
        <div className="flex flex-col gap-x-5 gap-y-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
          {event.ticketUrl ? (
            <a className="btn btn-uv min-h-[52px]" href={event.ticketUrl} target="_blank" rel="noopener">
              Billetterie <span aria-hidden="true">→</span>
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          ) : (
            <Link className="btn btn-uv min-h-[52px]" to={href}>
              Billetterie <span aria-hidden="true">→</span>
            </Link>
          )}
          <div className="flex justify-center sm:block">
            <CalendarMenu event={event} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Cartes des dates suivantes : plus simples, sans uv (un seul uv par écran). */
export function UpcomingCard({ event }: { event: AgendaEvent }) {
  const where = place(event);
  return (
    <Link to={`/evenements/${event.slug}`} className="card group h-full">
      <EventVisual event={event} zoom className="aspect-[1920/1005]" />
      <span className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="lbl text-[12px] text-lotus">{formatDate(event.date)}</span>
          <StatusTag status={event.ticketStatus ?? "upcoming"} />
        </span>
        <span className="font-display text-[18px] leading-[1.15] font-semibold uppercase sm:text-[20px]">{event.title}</span>
        {where && <span className="lbl text-[11px] text-ink-muted">{where}</span>}
        <span className="lnk mt-auto">
          Voir l’événement <span className="ar" aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
}

import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { OutranceEvent } from "../../content/schemas";
import { fullTitle, place } from "../../lib/calendar";
import { formatDate, formatHours } from "../../lib/dates";
import { CalendarMenu, ShareMenu } from "../EventMenus";
import { Placeholder } from "../Placeholder";
import { StatusTag, type EventStatus } from "../Tag";
import { HeroMandala } from "./HeroMandala";
import { longestWord, ticketProvider } from "./event-data";

type Props = {
  event: OutranceEvent;
  status: EventStatus;
  upcoming: boolean;
  /** Billetterie ouverte (à venir, lien connu, pas complet). */
  canBuy: boolean;
  /** La barre collante porte le bouton uv en mobile : on le masque ici sous 640px. */
  hasBar: boolean;
  hasPhotos: boolean;
};

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Fil d’Ariane" className="relative">
      <ol className="lbl m-0 flex list-none flex-wrap items-center gap-x-2 p-0 text-[10px] text-ink-muted sm:text-[11px] lg:text-[12px]">
        <li>
          <Link to="/agenda" prefetch="intent" className="inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-ink">
            Agenda
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}

export function EventHero({ event, status, upcoming, canBuy, hasBar, hasPhotos }: Props) {
  const hours = formatHours(event.start, event.end);
  const where = place(event);
  const provider = event.ticketUrl ? ticketProvider(event.ticketUrl) : null;
  // Le h1 ne déborde jamais : sa taille est plafonnée par la largeur de sa colonne (unités cqw)
  // selon la longueur du plus long mot (≈ 0,88 em par capitale en Unbounded 800).
  const fit = { "--h1-fit": `calc(100cqw / ${(longestWord(event.title) * 0.88).toFixed(2)})` } as CSSProperties;

  return (
    <section className="relative overflow-hidden">
      <HeroMandala />
      <div className="wrap relative flex flex-col gap-[18px] pt-5 pb-10 sm:gap-8 sm:pt-8 sm:pb-[72px] lg:gap-10 lg:pt-10 lg:pb-20">
        <Breadcrumb title={event.title} />

        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center sm:gap-x-9 sm:gap-y-8 lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-14 lg:gap-y-0">
          <Placeholder
            motif="poster"
            label="[Affiche de l’événement — format 4:5]"
            className="reveal aspect-[4/5] w-full rounded-md border border-line sm:col-start-1 sm:row-start-1 lg:row-span-4 lg:max-w-[512px]"
          />

          <div className="@container flex min-w-0 flex-col gap-[18px] sm:col-start-2 sm:row-start-1 lg:row-start-2 lg:gap-6">
            <div className="reveal">
              <StatusTag status={status} />
            </div>
            <p className="lbl reveal m-0 text-[12px] text-lotus sm:text-[13px] lg:text-[15px]">
              {formatDate(event.date)}
              {hours && (
                <>
                  {" "}
                  <span aria-hidden="true">◉</span> {hours}
                </>
              )}
            </p>
            <h1
              style={fit}
              className="disp reveal reveal-d1 text-[length:min(var(--h1-max),var(--h1-fit))] leading-[0.96] font-extrabold tracking-[-0.01em] break-words [--h1-max:34px] sm:leading-[0.94] sm:tracking-[-0.02em] sm:[--h1-max:48px] lg:leading-[0.92] lg:[--h1-max:clamp(40px,6vw,84px)]"
            >
              {event.titlePrefix && (
                <span className="mb-2 block text-[14px] tracking-[0.06em] text-ink-muted sm:mb-2.5 sm:text-[18px] sm:tracking-[0.04em] lg:mb-3 lg:text-[max(18px,0.42em)]">
                  {event.titlePrefix}
                </span>
              )}
              {event.title}
            </h1>
            {where && <p className="lbl reveal reveal-d1 m-0 text-[11px] text-ink sm:text-[12px] lg:text-[13px]">{where}</p>}
            {event.tagline && (
              <p className="reveal reveal-d2 m-0 max-w-[560px] text-[16px] text-ink-muted sm:text-[17px] lg:text-[19px]">
                {event.tagline}
              </p>
            )}
          </div>

          <div
            id="billetterie"
            className="relative z-[3] flex scroll-mt-24 flex-wrap items-center gap-x-7 gap-y-3 sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-3 lg:pt-8"
          >
            {canBuy && event.ticketUrl && (
              <a
                className={`btn btn-uv min-h-[52px] px-[26px] sm:max-lg:flex-1 ${hasBar ? "max-sm:hidden" : ""}`}
                href={event.ticketUrl}
                rel="noopener"
              >
                {provider ? `Billetterie ${provider}` : "Billetterie"} <span aria-hidden="true">↗</span>
              </a>
            )}
            {upcoming && <CalendarMenu event={event} label="Mon agenda" />}
            <ShareMenu title={fullTitle(event)} slug={event.slug} />
            {!upcoming && hasPhotos && (
              <Link className="lnk" to={`/galerie?album=${event.slug}`} prefetch="intent">
                Voir les photos <span className="ar" aria-hidden="true">→</span>
              </Link>
            )}
            {upcoming && event.facebookUrl && (
              <p className="lbl reveal reveal-d3 m-0 basis-full text-[12px] text-ink-muted">
                Événement Facebook{" "}
                <a className="inline-flex min-h-11 items-center" href={event.facebookUrl} rel="noopener">
                  <span aria-hidden="true">→</span>&nbsp;Je participe
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

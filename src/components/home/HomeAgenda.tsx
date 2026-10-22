import { Link } from "react-router";
import { dateBadge, formatDate } from "../../lib/dates";
import { Placeholder } from "../Placeholder";
import { Reveal } from "../Reveal";
import { StatusTag } from "../Tag";
import type { HeroEvent } from "./Hero";

// Agenda de l’accueil : la carte du prochain événement (sinon du dernier), puis trois dates passées.
// Apparition une seule fois au scroll (fondu + 24 px, cascade de 80 ms).
const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function longDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return { weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], month: `${MONTHS[m - 1]} ${y}` };
}

const place = (e: HeroEvent) => [e.venue, e.city].filter(Boolean).join(" — ");

export function HomeAgenda({ featured, upcoming, past }: { featured: HeroEvent | null; upcoming: boolean; past: HeroEvent[] }) {
  return (
    <section aria-labelledby="home-agenda" className="wrap pt-16 pb-16 sm:pt-[112px] sm:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 sm:pb-9">
        <Reveal className="flex flex-col gap-3">
          <span className="lbl text-lotus">Événements</span>
          <h2 id="home-agenda" className="disp text-[36px] leading-none font-bold tracking-[-0.01em] sm:text-display-l">
            Agenda
          </h2>
        </Reveal>
        <Link className="lnk" to="/agenda" prefetch="intent">
          Tout l’agenda <span className="ar" aria-hidden="true">→</span>
        </Link>
      </div>

      {featured && (
        <Reveal delay={80}>
          <Link to={`/evenements/${featured.slug}`} className="card group sm:flex-row" prefetch="intent">
            <Placeholder label="[Visuel de l’événement]" zoom className="aspect-[1920/1005] w-full flex-none sm:aspect-auto sm:min-h-[260px] sm:w-[46%] lg:h-[300px] lg:w-[560px]" />
            <span className="flex flex-col gap-3.5 p-5 sm:p-8">
              {upcoming ? (
                <span className="lbl flex items-center gap-2.5 text-lotus">
                  <span aria-hidden="true" className="pulse-dot size-2 rounded-pill bg-lotus" />
                  À venir
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-3">
                  <StatusTag status="past" />
                  <span className="lbl text-[11px] text-ink-muted">Dernier événement</span>
                </span>
              )}
              <span className="flex items-baseline gap-4">
                <span className={`disp text-[52px] leading-none font-extrabold sm:text-[64px] ${upcoming ? "text-lotus" : "text-ink-muted"}`}>
                  {dateBadge(featured.date).day}
                </span>
                <span className="lbl">
                  {longDay(featured.date).weekday}
                  <br />
                  {longDay(featured.date).month}
                </span>
              </span>
              <span className="disp text-[22px] leading-[1.15] font-semibold sm:text-[28px]">
                {featured.titlePrefix ? `${featured.titlePrefix} ${featured.title}` : featured.title}
              </span>
              {place(featured) && <span className="lbl text-ink-muted">{place(featured)}</span>}
            </span>
          </Link>
        </Reveal>
      )}

      {past.length > 0 && (
        <ul className="m-0 list-none p-0 pt-7">
          {past.map((e, i) => (
            <Reveal as="li" key={e.slug} delay={160 + i * 80}>
              <Link
                to={`/evenements/${e.slug}`}
                prefetch="intent"
                className="group grid min-h-20 grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-t border-line px-2 py-3.5 text-ink no-underline hover:bg-nuit-raised hover:text-ink sm:grid-cols-[170px_minmax(0,1.4fr)_minmax(0,1fr)_40px]"
              >
                <span className="lbl text-lotus transition-transform duration-300 group-hover:translate-x-2">{formatDate(e.date)}</span>
                <span className="disp col-start-1 text-[17px] leading-[1.15] font-semibold transition-transform duration-300 group-hover:translate-x-2 sm:col-start-auto sm:text-[20px]">
                  {e.title}
                </span>
                <span className="lbl col-start-1 text-[12px] text-ink-muted sm:col-start-auto">{place(e)}</span>
                <span aria-hidden="true" className="col-start-2 row-span-3 row-start-1 text-lotus transition-transform duration-300 group-hover:translate-x-1.5 sm:col-start-auto sm:row-span-1 sm:row-start-auto">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}

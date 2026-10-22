import { Link } from "react-router";
import { Reveal } from "../Reveal";
import { Tag } from "../Tag";
import { place } from "../../lib/calendar";
import { formatDate, year } from "../../lib/dates";
import { COUNTRY_TAG, TTL, type AgendaEvent } from "./agenda-data";

// Survol (desktop et tablette, pointeur fin) : fond nuit-raised, contenu décalé par translateX
// (la maquette anime padding-left, ce qu’interdit CLAUDE.md), flèche qui avance.
const SHIFT =
  "transition-transform duration-[250ms] ease-nuit sm:group-hover:translate-x-3 sm:group-focus-visible:translate-x-3";

function ArchiveRow({ event }: { event: AgendaEvent }) {
  const where = place(event);
  return (
    <Link
      to={`/evenements/${event.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-t border-line py-3.5 text-ink no-underline transition-colors duration-[250ms] hover:text-ink sm:min-h-[84px] sm:grid-cols-[130px_minmax(0,1fr)_auto_20px] sm:gap-4 sm:px-2 sm:hover:bg-nuit-raised sm:focus-visible:bg-nuit-raised lg:grid-cols-[150px_minmax(0,1.3fr)_minmax(0,1fr)_auto_28px] lg:gap-5"
    >
      <span className={`lbl text-[11px] text-lotus sm:text-[12px] ${SHIFT}`}>{formatDate(event.date)}</span>
      <span className="order-last col-span-2 flex flex-col gap-1 sm:order-none sm:col-span-1 lg:contents">
        <span className={`${TTL} block text-[16px] text-ink-muted group-hover:text-ink group-focus-visible:text-ink sm:text-[17px] lg:text-[18px] ${SHIFT}`}>
          {event.title}
        </span>
        {/* Toujours rendu : en desktop, c’est la 3e colonne de la grille. */}
        <span className={`lbl block text-[11px] text-ink-muted ${SHIFT}`}>{where}</span>
      </span>
      <Tag
        variant={event.country === "BE" ? "country" : "city"}
        className={`justify-self-end sm:justify-self-auto ${event.country === "FR" ? "sm:group-hover:bg-nuit sm:group-focus-visible:bg-nuit" : ""}`}
      >
        {COUNTRY_TAG[event.country]}
      </Tag>
      <span
        aria-hidden="true"
        className="hidden text-[18px] text-lotus transition-transform duration-[250ms] ease-nuit group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 sm:block"
      >
        →
      </span>
    </Link>
  );
}

/** Archives groupées par année (décroissante), événements du plus récent au plus ancien. */
export function ArchiveList({ events }: { events: AgendaEvent[] }) {
  const groups: { year: string; items: AgendaEvent[] }[] = [];
  for (const e of [...events].sort((a, b) => b.date.localeCompare(a.date))) {
    const y = year(e.date);
    const group = groups.at(-1);
    if (group?.year === y) group.items.push(e);
    else groups.push({ year: y, items: [e] });
  }

  if (groups.length === 0) {
    return <p className="m-0 text-ink-muted">Aucun événement passé pour ce filtre.</p>;
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      {groups.map((g) => (
        <Reveal
          key={g.year}
          className="flex flex-col sm:grid sm:grid-cols-[minmax(0,120px)_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:gap-6"
        >
          <h2 className="disp pb-3 text-[36px] leading-none font-extrabold text-transparent [-webkit-text-stroke:1.2px_var(--color-lotus)] sm:pb-0 sm:text-[44px]">
            {g.year}
          </h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {g.items.map((e) => (
              <li key={e.slug}>
                <ArchiveRow event={e} />
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}

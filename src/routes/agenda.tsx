import { useState } from "react";
import { useSearchParams, type ShouldRevalidateFunctionArgs } from "react-router";
import { ArchiveList } from "../components/agenda/ArchiveList";
import { ComingSoon } from "../components/agenda/ComingSoon";
import { FeaturedEventCard, UpcomingCard } from "../components/agenda/FeaturedEventCard";
import {
  COUNTRY_OPTIONS,
  atVenue,
  parseCountry,
  parseView,
  resultMessage,
  toAgendaEvent,
  yearsSince,
  type Country,
  type View,
} from "../components/agenda/agenda-data";
import { ChipGroup } from "../components/ChipGroup";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { TabPanel, Tabs, useTabIds } from "../components/Tabs";
import { events } from "../content/load.server";
import { isUpcoming } from "../lib/dates";
import { useHydrated } from "../lib/useHydrated";
import { useNow } from "../lib/useNow";
import { site } from "../site";
import type { Route } from "./+types/agenda";

export async function loader() {
  return { events: events.map(toAgendaEvent) };
}

export const meta: Route.MetaFunction = () => [
  { title: `Agenda — ${site.name}` },
  {
    name: "description",
    content: "Les prochaines soirées psytrance d’Outrance à Lyon et en Belgique, et toutes les archives depuis la première en 2014.",
  },
];

// L’onglet et le filtre vivent dans l’URL : inutile de recharger les données quand ils changent.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

const EMPTY = new URLSearchParams();

export default function Agenda({ loaderData }: Route.ComponentProps) {
  const now = useNow();
  const hydrated = useHydrated();
  const [searchParams, setSearchParams] = useSearchParams();
  // Le pré-rendu ne connaît pas la query : on lit l’URL seulement après l’hydratation.
  const params = hydrated ? searchParams : EMPTY;
  const view = parseView(params.get("vue"));
  const country = parseCountry(params.get("pays"));
  const [announce, setAnnounce] = useState(false);
  const ids = useTabIds("agenda");

  const keep = (e: { country: string }) => country === "all" || e.country === country;
  const all = loaderData.events;
  const upcoming = all
    .filter((e) => keep(e) && isUpcoming(e, now))
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = all.filter((e) => keep(e) && !isUpcoming(e, now));
  const [next, ...later] = upcoming;

  const update = (v: View, c: Country) => {
    setAnnounce(true);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (v === "archive") p.set("vue", "archives");
        else p.delete("vue");
        if (c === "all") p.delete("pays");
        else p.set("pays", c.toLowerCase());
        return p;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const first = [...all].sort((a, b) => a.date.localeCompare(b.date))[0];
  const intro = `Nos prochaines soirées à Lyon et en Belgique, et ${yearsSince(site.association.founded, now)} ans d’archives depuis la toute première${first?.venue ? ` ${atVenue(first.venue)}` : ""}.`;

  const emptyTitle =
    upcoming.length === 0 && country === "BE" ? "Pas encore de date annoncée en Belgique" : "La suite arrive bientôt";

  return (
    <>
      <PageHeader label="Événements" title="Agenda" intro={<p className="m-0">{intro}</p>}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:border-t sm:border-line sm:pt-2">
          <Tabs
            label="Période"
            ids={ids}
            value={view}
            onChange={(v) => update(v, country)}
            className="border-b border-line sm:border-b-0"
            tabs={[
              { value: "upcoming", label: "À venir", count: upcoming.length },
              { value: "archive", label: "Archives", count: past.length },
            ]}
          />
          <ChipGroup
            label="Filtrer par pays"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={(c) => update(view, c)}
            stretch
            className="w-full sm:w-auto"
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {announce ? resultMessage(view, country, view === "upcoming" ? upcoming.length : past.length) : ""}
        </p>
      </PageHeader>

      <TabPanel ids={ids} value="upcoming" active={view === "upcoming"} className="wrap pt-2 pb-16 sm:pt-0 sm:pb-24">
        <div className="flex flex-col gap-3.5 sm:gap-5">
          {next && (
            <Reveal>
              <FeaturedEventCard event={next} />
            </Reveal>
          )}
          {later.length > 0 && (
            <section aria-labelledby="agenda-ensuite" className="flex flex-col gap-4 pt-4">
              <h2 id="agenda-ensuite" className="lbl m-0 text-ink-muted">
                Dates suivantes
              </h2>
              <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {later.map((e, i) => (
                  <Reveal as="li" key={e.slug} delay={i * 80}>
                    <UpcomingCard event={e} />
                  </Reveal>
                ))}
              </ul>
            </section>
          )}
          <ComingSoon title={emptyTitle} />
        </div>
      </TabPanel>

      <TabPanel ids={ids} value="archive" active={view === "archive"} className="wrap pt-2 pb-16 sm:pt-0 sm:pb-24">
        <ArchiveList events={past} />
      </TabPanel>
    </>
  );
}

import { useRef } from "react";
import { Hero, type HeroEvent } from "../components/home/Hero";
import { HomeAgenda } from "../components/home/HomeAgenda";
import { RosterMarquee } from "../components/home/RosterMarquee";
import { StatsIris } from "../components/home/StatsIris";
import { useMouseEffects } from "../components/home/useMouseEffects";
import { Newsletter } from "../components/Newsletter";
import { artists, events, site as fullSite } from "../content/load.server";
import { featuredEvent, isUpcoming } from "../lib/dates";
import { useMotionLevel } from "../lib/useMotionLevel";
import { useNow } from "../lib/useNow";
import { site } from "../site";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: `${site.name} — ${site.tagline}` },
  { name: "description", content: site.metaDescription },
];

export function loader() {
  const list: (HeroEvent & { start?: string | null; end?: string | null; country: string })[] = events.map((e) => ({
    slug: e.slug,
    title: e.title,
    titlePrefix: e.titlePrefix,
    date: e.date,
    start: e.start,
    end: e.end,
    venue: e.venue,
    city: e.city,
    country: e.country,
    ticketUrl: e.ticketUrl,
    ticketStatus: e.ticketStatus,
    lineup: e.lineup,
  }));
  return {
    events: list,
    roster: artists.map((a) => ({ slug: a.slug, name: a.name })),
    stats: fullSite.stats.flatMap((s) => (s.value === null ? [] : [{ value: s.value, label: s.label }])),
    founded: fullSite.association.founded,
  };
}

// Accueil animé (Main.dc.html, Accueil-tablette, Accueil-mobile).
export default function Home({ loaderData }: Route.ComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();
  const now = useNow();
  const featured = featuredEvent(loaderData.events, now);
  const past = loaderData.events.filter((e) => !isUpcoming(e, now) && e.slug !== featured?.event.slug).slice(0, 3);
  useMouseEffects(rootRef, level === "full");

  return (
    <div ref={rootRef} data-motion={level} className="relative">
      <Hero event={featured?.event ?? null} upcoming={featured?.upcoming ?? false} level={level} />
      <RosterMarquee names={loaderData.roster.map((a) => a.name)} level={level} />
      <HomeAgenda featured={featured?.event ?? null} upcoming={featured?.upcoming ?? false} past={past} />
      <StatsIris stats={loaderData.stats} founded={loaderData.founded} level={level} />
      <div className="wrap relative py-16 sm:py-24">
        <Newsletter id="newsletter" />
      </div>
    </div>
  );
}

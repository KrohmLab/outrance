import { useRef } from "react";
import { Hero, type HeroEvent } from "../components/home/Hero";
import { useMouseEffects } from "../components/home/useMouseEffects";
import { Newsletter } from "../components/Newsletter";
import { events } from "../content/load.server";
import { featuredEvent } from "../lib/dates";
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
  return { events: list };
}

// Accueil animé (Main.dc.html, Accueil-tablette, Accueil-mobile).
export default function Home({ loaderData }: Route.ComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const level = useMotionLevel();
  const now = useNow();
  const featured = featuredEvent(loaderData.events, now);
  useMouseEffects(rootRef, level === "full");

  return (
    <div ref={rootRef} data-motion={level} className="relative">
      <Hero event={featured?.event ?? null} upcoming={featured?.upcoming ?? false} level={level} />
      <div className="wrap relative py-16 sm:py-24">
        <Newsletter id="newsletter" />
      </div>
    </div>
  );
}

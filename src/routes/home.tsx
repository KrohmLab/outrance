import { useRef } from "react";
import { Hero, type HeroEvent } from "../components/home/Hero";
import { useHomeIntro } from "../components/home/useHomeIntro";
import { ORBIT_ORDER } from "../components/home/signatures";
import { Motes, MOTE_COUNT } from "../components/home/Motes";
import { HomeAgenda } from "../components/home/HomeAgenda";
import { RosterMarquee } from "../components/home/RosterMarquee";
import { RosterOrbit } from "../components/home/RosterOrbit";
import { AftermoviesTrack } from "../components/home/AftermoviesTrack";
import { BelgiumBand } from "../components/home/BelgiumBand";
import { Finale } from "../components/home/Finale";
import { SocialPosts } from "../components/home/SocialPosts";
import { StatsIris } from "../components/home/StatsIris";
import { useMouseEffects } from "../components/home/useMouseEffects";
import { aftermovies, artists, events, site as fullSite } from "../content/load.server";
import { featuredEvent, isUpcoming } from "../lib/dates";
import { useMotionLevel } from "../lib/useMotionLevel";
import { useNow } from "../lib/useNow";
import { site } from "../site";
import type { Route } from "./+types/home";
import { pageMeta } from "../lib/seo";

export const meta: Route.MetaFunction = () => [
  ...pageMeta({ title: `${site.name} — ${site.tagline}`, description: site.metaDescription, path: "/" }),
  {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: `${site.url}/og/outrance.png`,
      email: site.emails.contact,
      sameAs: [site.socials.instagram, site.socials.facebook, site.socials.soundcloud, site.socials.youtube],
    },
  },
];

const rank = (slug: string) => {
  const i = ORBIT_ORDER.indexOf(slug);
  return i < 0 ? ORBIT_ORDER.length : i;
};

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
    roster: artists
      .map((a) => ({ slug: a.slug, name: a.name, format: a.format, genres: a.genres, bio: a.bio }))
      .sort((a, b) => rank(a.slug) - rank(b.slug)),
    stats: fullSite.stats.flatMap((s) => (s.value === null ? [] : [{ value: s.value, label: s.label }])),
    founded: fullSite.association.founded,
    aftermovies,
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
  const intro = useHomeIntro();

  return (
    <div ref={rootRef} data-motion={level} className={`relative isolate ${intro ? "home-intro" : ""}`}>
      {/* Ciel de l’accueil (comme la fenêtre de la maquette) : lucioles fixes derrière toute la page,
          visibles partout où une section n’a pas son propre fond. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <Motes count={MOTE_COUNT[level]} />
      </div>
      <Hero event={featured?.event ?? null} upcoming={featured?.upcoming ?? false} level={level} intro={intro} />
      <RosterMarquee names={loaderData.roster.map((a) => a.name)} level={level} />
      <HomeAgenda featured={featured?.event ?? null} upcoming={featured?.upcoming ?? false} past={past} />
      <StatsIris stats={loaderData.stats} founded={loaderData.founded} level={level} />
      <RosterOrbit artists={loaderData.roster} level={level} />
      <AftermoviesTrack movies={loaderData.aftermovies} level={level} />
      <BelgiumBand level={level} />
      <SocialPosts />
      <Finale level={level} />
    </div>
  );
}

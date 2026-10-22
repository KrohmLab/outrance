import { AftermoviesSection } from "../components/association/AftermoviesSection";
import { StatsBand } from "../components/association/StatsBand";
import { StoryHero } from "../components/association/StoryHero";
import { Team } from "../components/association/Team";
import { Timeline } from "../components/association/Timeline";
import { aftermovies, site, team, timeline } from "../content/load.server";
import type { Route } from "./+types/association";
import { pageMeta } from "../lib/seo";

// L’association (Association.dc.html, -tablette, -mobile) : histoire, chiffres, timeline, équipe, aftermovies.
export function loader() {
  return {
    association: site.association,
    stats: site.stats,
    emails: site.emails,
    timeline,
    team,
    aftermovies,
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({ title: "L’association — Outrance", description: loaderData?.association.intro ?? "", path: "/association" });

export default function Association({ loaderData }: Route.ComponentProps) {
  const { association, stats, emails, timeline, team, aftermovies } = loaderData;
  return (
    <>
      <StoryHero founded={association.founded} story={association.story} />
      <StatsBand stats={stats} />
      <Timeline steps={timeline} intro={association.story[2]} />
      <Team team={team} emails={emails} />
      <AftermoviesSection movies={aftermovies} />
    </>
  );
}

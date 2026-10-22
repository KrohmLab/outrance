import { Link } from "react-router";
import type { LineupItem } from "../../content/schemas";
import { Placeholder } from "../Placeholder";
import { splitNames, type RosterLink } from "./event-data";

// Line-up : grille de cartes (rail horizontal aimanté en mobile). Seuls les artistes du roster
// sont liés à leur fiche (/artistes?artiste=…) ; les invités restent des cartes non cliquables.

const GUTTER = "clamp(16px,4vw,48px)";

function rosterSlug(item: LineupItem, roster: RosterLink[]): string | null {
  const names = splitNames(item.name).map((n) => n.toLowerCase());
  // Un B2B « X vs Y » ne renvoie vers une fiche que s’il n’y a qu’un artiste du roster dedans.
  const matches = roster.filter((r) => names.includes(r.name.toLowerCase()));
  return matches.length === 1 ? (matches[0]?.slug ?? null) : null;
}

function Card({ item, slug }: { item: LineupItem; slug: string | null }) {
  const meta = [item.format, item.genre].filter(Boolean);
  const extra = [item.label, item.note].filter(Boolean).join(" — ");
  const body = (
    <>
      <Placeholder motif="lineup" label="[Photo artiste]" zoom={Boolean(slug)} className="aspect-[4/5] w-full" />
      <span className="flex flex-col gap-1 p-3.5 pb-4 sm:gap-2 sm:p-5">
        <span className="disp text-[15px] leading-[1.15] font-semibold sm:text-[18px] lg:text-[20px]">{item.name}</span>
        {meta.length > 0 && (
          <span className="lbl text-[11px] text-lotus">
            {meta[0]}
            {meta[1] && (
              <>
                {" "}
                <span aria-hidden="true">◉</span> {meta[1]}
              </>
            )}
          </span>
        )}
        {extra && <span className="lbl text-[11px] text-ink-muted">{extra}</span>}
      </span>
    </>
  );
  return slug ? (
    <Link to={`/artistes?artiste=${slug}`} className="card h-full" prefetch="intent">
      {body}
    </Link>
  ) : (
    <div className="flex h-full flex-col overflow-hidden rounded-md bg-nuit-raised">{body}</div>
  );
}

export function Lineup({ lineup, roster, decoration }: { lineup: LineupItem[]; roster: RosterLink[]; decoration?: string | null }) {
  if (lineup.length === 0) return null;
  return (
    <section aria-labelledby="lineup-titre" className="border-t border-line">
      <div className="flex flex-col gap-5 pt-12 pb-12 sm:gap-8 sm:py-[72px] lg:gap-10 lg:py-24">
        <div className="wrap flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-3">
            <span className="lbl text-lotus">Line-up</span>
            <h2 id="lineup-titre" className="disp text-[32px] leading-none font-bold tracking-[-0.01em] sm:text-[44px] lg:text-[clamp(30px,3.6vw,48px)]">
              Artistes
            </h2>
          </div>
          {decoration && <span className="lbl hidden text-[11px] text-ink-muted sm:block">Déco : {decoration}</span>}
        </div>
        <ul
          style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          className="m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto p-0 [scrollbar-width:none] sm:wrap sm:grid sm:snap-none sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] lg:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {lineup.map((item) => (
            <li key={item.name} className="w-[190px] flex-none snap-start sm:w-auto">
              <Card item={item} slug={rosterSlug(item, roster)} />
            </li>
          ))}
        </ul>
        {decoration && <p className="lbl m-0 px-4 text-[11px] text-ink-muted sm:hidden">Déco : {decoration}</p>}
      </div>
    </section>
  );
}

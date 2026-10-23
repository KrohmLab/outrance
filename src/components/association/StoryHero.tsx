import { PageMandala } from "./PageMandala";

// Hero « Notre histoire » : label, h1 et les deux premiers paragraphes de site.json → association.story.
type Props = { founded: string; story: string[] };

export function StoryHero({ founded, story }: Props) {
  const [first, second] = story;
  return (
    <section className="relative overflow-x-clip">
      {/* Mobile : 520 px, 8 pétales, trait 1. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-[100px] -right-[230px] -z-10 size-[520px] opacity-45 sm:hidden">
        <PageMandala petals={8} strokeWidth={1} />
      </div>
      {/* Tablette : 700 px ; desktop : 820 px. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[160px] -right-[300px] -z-10 hidden size-[700px] opacity-50 sm:block lg:-top-[170px] lg:-right-[200px] lg:size-[820px]"
      >
        <PageMandala petals={9} />
      </div>

      <div className="wrap relative flex flex-col gap-[18px] py-14 sm:gap-[22px] sm:py-20 lg:gap-7 lg:py-24">
        <span className="lbl reveal text-[12px] text-lotus lg:text-[13px]">Notre histoire depuis {founded.slice(0, 4)}</span>
        <h1 className="disp reveal reveal-d1 max-w-[880px] text-[clamp(32px,10.3vw,40px)] leading-[0.94] font-extrabold tracking-[-0.01em] sm:text-[clamp(44px,8.15vw,68px)] sm:leading-[0.92] sm:tracking-[-0.02em] lg:text-[clamp(44px,7vw,96px)]">
          L’association <br />
          Outrance
        </h1>
        <div className="reveal reveal-d2 grid max-w-[640px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-y-[18px] sm:gap-y-[22px] lg:max-w-[1040px] lg:gap-x-14 lg:gap-y-8">
          {first && <p className="m-0 text-[17px] text-ink sm:text-body-l">{first}</p>}
          {second && <p className="m-0 text-[15px] text-ink-muted sm:text-[17px]">{second}</p>}
        </div>
      </div>
    </section>
  );
}

import { site } from "../../site";
import { Placeholder } from "../Placeholder";
import { Reveal } from "../Reveal";
import { SocialLinks } from "../SocialLinks";

// Sur les réseaux : six publications Instagram en placeholder (aucune intégration, aucun cookie).
export function SocialPosts() {
  const handle = `@${new URL(site.socials.instagram).pathname.replace(/\//g, "")}`;
  return (
    <section aria-labelledby="home-socials" className="wrap flex flex-col gap-8 py-12 sm:py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="lbl text-lotus">Sur les réseaux</span>
          <h2 id="home-socials" className="disp text-[30px] leading-none font-bold sm:text-[44px]">
            {handle}
          </h2>
        </div>
        <SocialLinks />
      </Reveal>
      <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Reveal as="li" key={i} delay={i * 70}>
            <a className="card" href={site.socials.instagram} aria-label={`Publication Instagram ${i + 1}`}>
              <Placeholder label={`[Post ${i + 1}]`} zoom className="aspect-square w-full" />
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

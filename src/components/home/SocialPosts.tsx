import type { InstagramPost } from "../../content/schemas";
import { site } from "../../site";
import { PlayIcon } from "../icons";
import { Placeholder } from "../Placeholder";
import { Reveal } from "../Reveal";
import { SocialLinks } from "../SocialLinks";

// Sur les réseaux : les six dernières publications Instagram, récupérées au build (scripts/sync-meta.mjs)
// et servies par le site (aucun appel à Instagram, aucun cookie). Sans synchronisation : placeholders.

/** Début de la légende, pour le texte alternatif et le nom du lien. */
function excerpt(caption: string) {
  const line = caption.split("\n")[0]?.trim() ?? "";
  return line.length > 90 ? `${line.slice(0, 89)}…` : line;
}

export function SocialPosts({ posts }: { posts: InstagramPost[] }) {
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
        {posts.length > 0
          ? posts.map((post, i) => (
              <Reveal as="li" key={post.id} delay={i * 70}>
                <a
                  className="card group relative block"
                  href={post.permalink}
                  rel="noopener"
                  aria-label={`Publication Instagram${post.caption ? ` : ${excerpt(post.caption)}` : ` ${i + 1}`}`}
                >
                  <span className="block aspect-square w-full overflow-hidden bg-placeholder">
                    <img src={post.image} alt="" loading="lazy" decoding="async" className="zoom size-full object-cover" />
                  </span>
                  {post.video && (
                    <span aria-hidden="true" className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-pill bg-nuit/70 text-ink">
                      <PlayIcon size={14} />
                    </span>
                  )}
                </a>
              </Reveal>
            ))
          : Array.from({ length: 6 }, (_, i) => (
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

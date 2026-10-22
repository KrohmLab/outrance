import type { ComponentType } from "react";
import { socials } from "../site";
import { FacebookIcon, InstagramIcon, SoundCloudIcon, YouTubeIcon } from "./icons";

const ICONS: Record<(typeof socials)[number]["key"], ComponentType> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  soundcloud: SoundCloudIcon,
  youtube: YouTubeIcon,
};

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {socials.map(({ key, label, href }) => {
        const Glyph = ICONS[key];
        return (
          <a key={key} className="icon-btn" href={href} aria-label={label} rel="noopener">
            <Glyph />
          </a>
        );
      })}
    </div>
  );
}

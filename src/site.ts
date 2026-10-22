import site from "../content/site.json";

export { site };

export type NavItem = { label: string; href: string; external?: boolean };

export const nav: NavItem[] = site.nav;
export const footerNav: NavItem[] = site.footerNav;

/** Entrées du menu plein écran (tablette et mobile) : comme le plan du site du footer. */
export const menuNav: NavItem[] = site.footerNav;

export const socials = [
  { key: "instagram", label: "Instagram", href: site.socials.instagram },
  { key: "facebook", label: "Facebook", href: site.socials.facebook },
  { key: "soundcloud", label: "SoundCloud", href: site.socials.soundcloud },
  { key: "youtube", label: "YouTube", href: site.socials.youtube },
] as const;

export { default as logoUrl } from "../assets/logo/outrance-logo-white.png";

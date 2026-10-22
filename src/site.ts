import logoLarge from "../assets/logo/outrance-logo-white-1200.png";
import logoSmall from "../assets/logo/outrance-logo-white-480.png";
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

// Logo officiel redimensionné (sans retouche) : 480 px pour le header, le footer et les petits usages,
// 1200 px pour les grands logos de l’accueil (écrans haute densité).
export { default as logoUrl } from "../assets/logo/outrance-logo-white-480.png";
export const logoSrcSet = `${logoSmall} 480w, ${logoLarge} 1200w`;

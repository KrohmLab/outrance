import { useEffect, useRef, type RefObject } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useModal } from "../lib/useModal";
import { fullTitle } from "../lib/calendar";
import { formatDate } from "../lib/dates";
import { useFeaturedEvent, useTicketingHref } from "../lib/featured";
import { menuNav, site } from "../site";
import { Mandala } from "./Mandala";
import { SocialLinks } from "./SocialLinks";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Le header reste visible au-dessus du menu : son bouton burger (devenu croix) ferme le menu. */
  headerRef: RefObject<HTMLElement | null>;
  returnFocusRef: RefObject<HTMLElement | null>;
};

/**
 * Menu plein écran des tablettes et mobiles (artboards Agenda-tablette, Accueil-mobile) :
 * rideau qui descend sous le header (clip-path, 550 ms) et liens qui montent en cascade.
 */
export function MobileMenu({ open, onClose, headerRef, returnFocusRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const featured = useFeaturedEvent();
  const ticketingHref = useTicketingHref();

  // Toute navigation referme le menu.
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Passage en desktop : le menu n’existe plus.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && onClose();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [onClose]);

  // Piège de focus sur le header (logo, croix) et le menu ; le reste de la page devient inerte.
  useModal({ open, onClose, containers: [headerRef, panelRef], initialFocus: panelRef, returnFocus: returnFocusRef, keepHeader: true });

  return (
    <div
      ref={panelRef}
      id="menu-principal"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      data-open={open || undefined}
      className="menu-panel fixed inset-x-0 top-[68px] bottom-0 z-30 overflow-x-hidden overflow-y-auto bg-nuit sm:top-[76px] lg:hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-60 -bottom-60 size-[600px] opacity-30 sm:-right-[260px] sm:-bottom-[260px] sm:size-[640px] sm:opacity-35"
      >
        <Mandala />
      </div>

      <div className="relative grid gap-2 py-8 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:gap-10 sm:px-8 sm:py-12">
        <nav aria-label="Navigation principale" className="menu-links flex flex-col px-4 sm:px-0">
          {menuNav.map((item, index) => {
            const last = index === menuNav.length - 1;
            const className = `disp py-3 text-[32px] leading-[1.1] font-bold no-underline sm:py-2.5 sm:text-[44px] ${
              last ? "" : "border-b border-line"
            }`;
            return item.external ? (
              <a key={item.href} href={item.href} className={`${className} text-lotus!`}>
                {item.label} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <NavLink key={item.href} to={item.href} className={className}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3.5 px-4 py-2 sm:gap-5 sm:px-0 sm:pt-3">
          {featured && (
            <div className="hidden flex-col gap-2 sm:flex">
              <span className="lbl text-[11px] text-ink-muted">{featured.upcoming ? "Prochain événement" : "Dernier événement"}</span>
              <Link to={`/evenements/${featured.event.slug}`} className="disp text-[20px] leading-[1.15] font-semibold text-ink! no-underline hover:text-lotus!">
                {fullTitle(featured.event)}
              </Link>
              <span className="lbl text-[11px] text-lotus">
                {[formatDate(featured.event.date), featured.event.venue ?? featured.event.city].filter(Boolean).join(" — ")}
              </span>
            </div>
          )}
          <Link className="btn btn-uv min-h-[52px]" to={ticketingHref}>
            Billetterie <span aria-hidden="true">→</span>
          </Link>
          <span className="lbl hidden pt-6 text-[11px] text-ink-muted sm:block">Nous suivre</span>
          <SocialLinks className="justify-center sm:-ml-2.5 sm:justify-start" />
          <a href={`mailto:${site.emails.contact}`} className="hidden font-semibold no-underline sm:block">
            {site.emails.contact}
          </a>
        </div>
      </div>
    </div>
  );
}

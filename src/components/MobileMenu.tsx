import { useEffect, useRef, type RefObject } from "react";
import { NavLink, useLocation } from "react-router";
import { menuNav, site, ticketingHref } from "../site";
import { Mandala } from "./Mandala";
import { SocialLinks } from "./SocialLinks";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

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

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const header = headerRef.current;
    const returnTo = returnFocusRef.current;
    if (!panel || !header) return;

    // Le reste de la page devient inerte et ne défile plus.
    const background = [document.getElementById("contenu"), document.getElementById("pied-de-page")].filter(
      (el): el is HTMLElement => el !== null,
    );
    background.forEach((el) => (el.inert = true));
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });

    // Piège de focus sur le header (logo, croix) et le menu.
    const focusables = () =>
      [...header.querySelectorAll<HTMLElement>(FOCUSABLE), ...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !items.includes(active as HTMLElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !items.includes(active as HTMLElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      background.forEach((el) => (el.inert = false));
      root.style.overflow = previousOverflow;
      returnTo?.focus({ preventScroll: true });
    };
  }, [open, onClose, headerRef, returnFocusRef]);

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
        <Mandala className="animate-spin-slow" />
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
          <a className="btn btn-uv min-h-[52px]" href={ticketingHref}>
            Billetterie <span aria-hidden="true">→</span>
          </a>
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

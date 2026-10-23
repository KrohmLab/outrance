import { useCallback, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { HeaderGauge } from "./home/HeaderGauge";
import { useTicketingHref } from "../lib/featured";
import { logoUrl, nav } from "../site";
import { BurgerIcon, CloseIcon, TicketIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const ticketingHref = useTicketingHref();
  // Accueil : header transparent posé sur le hero, avec la jauge de lecture qui reçoit le lotus.
  const isHome = useLocation().pathname === "/";

  return (
    <>
      <header
        ref={headerRef}
        data-home-header={isHome || undefined}
        className={`top-0 z-40 ${isHome ? "home-header fixed inset-x-0" : "sticky border-b border-line bg-nuit/90 backdrop-blur-[14px]"}`}
      >
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8 lg:wrap lg:h-auto lg:flex-wrap lg:gap-x-8 lg:gap-y-3 lg:py-4">
          <Link to="/" className="relative flex min-h-11 items-center">
            {isHome && <HeaderGauge headerRef={headerRef} />}
            <img
              src={logoUrl}
              alt="Outrance — accueil"
              width={1600}
              height={233}
              className={`block h-5 w-auto sm:h-6 lg:h-[26px] ${isHome ? "home-logo" : ""}`}
            />
          </Link>

          <nav aria-label="Navigation principale" className="hidden flex-wrap items-center gap-x-7 lg:flex">
            {nav.map((item) =>
              item.external ? (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <NavLink key={item.href} to={item.href} className="nav-link" prefetch="intent">
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Le brand book garde BILLETTERIE visible en mobile et en tablette. */}
            <Link className="billet-btn btn btn-ghost min-h-11 border-lotus! px-4 sm:px-6" to={ticketingHref} prefetch="intent">
              {/* Accueil mobile : une fois le lotus posé dans la jauge, le bouton se réduit à son icône. */}
              <TicketIcon className="billet-icon hidden" size={20} />
              <span className="billet-label">Billetterie</span>
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className="burger lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-principal"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} headerRef={headerRef} returnFocusRef={burgerRef} />
    </>
  );
}

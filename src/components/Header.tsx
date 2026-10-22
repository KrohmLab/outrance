import { useCallback, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { logoUrl, nav, ticketingHref } from "../site";
import { BurgerIcon, CloseIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-line bg-nuit/90 backdrop-blur-[14px]"
      >
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8 lg:wrap lg:h-auto lg:flex-wrap lg:gap-x-8 lg:gap-y-3 lg:py-4">
          <Link to="/" className="flex min-h-11 items-center">
            <img
              src={logoUrl}
              alt="Outrance — accueil"
              width={1600}
              height={233}
              className="block h-5 w-auto sm:h-6 lg:h-[26px]"
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
            <a className="btn btn-ghost hidden min-h-11 border-lotus! sm:inline-flex" href={ticketingHref}>
              Billetterie
            </a>
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

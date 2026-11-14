import { useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { HeaderGauge } from "./home/HeaderGauge";
import { logoUrl } from "../site";
import { BurgerIcon, CloseIcon, TicketTiltIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  // Même header partout : transparent en haut de page, fond et jauge de lecture au scroll. Sur l’accueil,
  // il est posé sur le hero (fixed) et la jauge reçoit le lotus ; ailleurs, il garde sa place (sticky).
  const isHome = useLocation().pathname === "/";

  return (
    <>
      <header
        ref={headerRef}
        data-home-header={isHome || undefined}
        className={`home-header top-0 z-40 ${isHome ? "fixed inset-x-0" : "sticky"}`}
      >
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8 lg:wrap">
          <Link to="/" className="relative flex min-h-11 items-center">
            <HeaderGauge headerRef={headerRef} auto={!isHome} />
            <img
              src={logoUrl}
              alt="Outrance — accueil"
              width={1600}
              height={233}
              className="home-logo block h-5 w-auto sm:h-6 lg:h-[26px]"
            />
          </Link>


          <div className="flex items-center gap-2.5">
            {/* Le brand book garde BILLETTERIE visible en mobile et en tablette. Il mène à l’agenda,
                qui remplace l’ancienne page Billetterie (toutes les dates à venir et leur billetterie). */}
            <Link className="billet-btn btn btn-ghost min-h-11 border-lotus! px-4 sm:px-6" to="/agenda" prefetch="intent">
              {/* Accueil mobile : une fois le lotus posé dans la jauge, le bouton se réduit à son icône. */}
              <TicketTiltIcon className="billet-icon hidden" size={22} />
              <span className="billet-label">Billetterie</span>
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className="burger"
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

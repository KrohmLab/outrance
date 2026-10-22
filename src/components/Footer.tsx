import { Link } from "react-router";
import { footerNav, logoUrl, site } from "../site";
import { SocialLinks } from "./SocialLinks";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer id="pied-de-page" className="border-t border-line">
      {/* Mobile (Agenda-mobile) : version courte. */}
      <div className="flex flex-col gap-3 px-4 pt-10 pb-7 sm:hidden">
        <img
          src={logoUrl}
          alt="Outrance"
          width={1600}
          height={233}
          loading="lazy"
          className="block h-auto w-[240px]"
        />
        <span className="lbl text-[10px] tracking-[0.3em] text-ink-muted">{site.tagline}</span>
        <a href={`mailto:${site.emails.contact}`} className="pt-2 font-semibold no-underline">
          {site.emails.contact}
        </a>
        <SocialLinks className="-ml-2.5" />
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3">
          <Link to="/presse-pro" className="lbl py-2.5 text-[10px] text-ink-muted! no-underline">
            Presse / Pro
          </Link>
          <Link to="/mentions-legales" className="lbl py-2.5 text-[10px] text-ink-muted! no-underline">
            Mentions légales
          </Link>
        </div>
        <span className="lbl text-[10px] text-ink-muted">© {YEAR} Outrance — aucun cookie</span>
      </div>

      {/* Tablette et desktop (Page-404, Agenda-tablette). */}
      <div className="hidden sm:block">
        <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-10 pt-16 pb-12">
          <div className="flex flex-col gap-2.5">
            <img
              src={logoUrl}
              alt="Outrance"
              width={1600}
              height={233}
              loading="lazy"
              className="block h-auto w-[240px] max-w-full"
            />
            <span className="lbl text-[11px] tracking-[0.3em] text-ink-muted">{site.tagline}</span>
            <p className="mt-2 mb-0 text-[15px] text-ink-muted">
              {site.association.legalForm} — Lyon, et en Belgique depuis {site.association.belgiumSince}.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="lbl text-[11px] text-ink-muted">Contact</span>
            <a href={`mailto:${site.emails.contact}`} className="font-semibold no-underline">
              {site.emails.contact}
            </a>
            <span className="lbl mt-3 text-[11px] text-ink-muted">Booking artistes</span>
            <a href={`mailto:${site.emails.booking}`} className="font-semibold no-underline">
              {site.emails.booking}
            </a>
          </div>

          <nav aria-label="Plan du site" className="grid grid-cols-2 content-start gap-x-6">
            {footerNav.map((item) =>
              item.external ? (
                <a key={item.href} href={item.href} className="nav-link py-2!">
                  {item.label} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link key={item.href} to={item.href} className="nav-link py-2!" prefetch="intent">
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex flex-col gap-2">
            <span className="lbl text-[11px] text-ink-muted">Nous suivre</span>
            <SocialLinks className="-ml-2.5" />
          </div>
        </div>

        <div className="wrap flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-line pt-5 pb-7">
          <span className="lbl text-[11px] text-ink-muted">
            © {YEAR} Outrance —{" "}
            <a href={site.footer.creditUrl} className="text-ink-muted! no-underline hover:text-ink!">
              {site.footer.credit}
            </a>
          </span>
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/mentions-legales" className="lbl text-[11px] text-ink-muted! no-underline">
              Mentions légales
            </Link>
            <span className="lbl text-[11px] text-ink-muted">Ce site n’utilise aucun cookie</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
